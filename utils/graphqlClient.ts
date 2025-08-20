// utils/graphqlClient.ts
import { request, gql } from 'graphql-request';

export const SUBGRAPH_ENDPOINTS: Record<string, string> = {
  usdxl: process.env.NEXT_PUBLIC_USDXL_SUBGRAPH || "",
  feusd: process.env.NEXT_PUBLIC_FEUSD_SUBGRAPH || "",
  kei: process.env.NEXT_PUBLIC_KEI_SUBGRAPH || "",
  usr: process.env.NEXT_PUBLIC_USR_SUBGRAPH || "",
  ush: process.env.NEXT_PUBLIC_USH_SUBGRAPH || "",
  usde: process.env.NEXT_PUBLIC_USDE_SUBGRAPH || "",
  usdhl: process.env.NEXT_PUBLIC_USDHL_SUBGRAPH || "",
  hbusdt: process.env.NEXT_PUBLIC_HBUSDT_SUBGRAPH || "",
};

export async function fetchTransfersByToken(
  tokenKey: string,
  txCount: number,
  minPriceWei: string
) {
  const endpoint = SUBGRAPH_ENDPOINTS[tokenKey.toLowerCase()];
  if (!endpoint) throw new Error(`Unknown token key: ${tokenKey}`);

  // Keep the original single page query intact (for backward compatibility)
  const query = gql`
    {
      transfers(
        where: { value_gt: "${minPriceWei}" }
        orderBy: timestamp_
        orderDirection: desc
        first: ${txCount}
      ) {
        id
        from
        to
        value
        timestamp_
        transactionHash_
      }
    }
  `;
  return request(endpoint, query);
}

// New: Add a paginated fetch that gets ALL transfers (batches of 1000)
const PAGE_SIZE = 1000;

export async function fetchAllTransfersByToken(
  tokenKey: string,
  start: number = 0,  // unix timestamp seconds, default start from 0
  end: number = Math.floor(Date.now() / 1000) + 3600 // default now + 1 hour buffer
) {
  const endpoint = SUBGRAPH_ENDPOINTS[tokenKey.toLowerCase()];
  if (!endpoint) throw new Error(`Unknown token key: ${tokenKey}`);

  const paginatedQuery = gql`
    query PagedTransfers($start: Int!, $end: Int!, $afterId: String) {
      transfers(
        first: ${PAGE_SIZE}
        orderBy: id
        orderDirection: asc
        where: { timestamp__gte: $start, timestamp__lt: $end, id_gt: $afterId }
      ) {
        id
        from
        to
        value
        timestamp_
        transactionHash_
        block_number
      }
    }
  `;

  let allTransfers = [];
  let afterId = "";
  while (true) {
    const response = await request(endpoint, paginatedQuery, {
      start,
      end,
      afterId,
    });
    const transfers = response.transfers || [];
    allTransfers = allTransfers.concat(transfers);
    if (transfers.length < PAGE_SIZE) break;
    afterId = transfers[transfers.length - 1].id;
  }
  return allTransfers;
}
