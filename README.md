# Hyperliquid Stablecoin Dashboard [DEMO](https://goldsky-dashboard.vercel.app/)

A comprehensive dashboard showcasing both Goldsky pipelines and traditional subgraphs to provide real-time, scalable analytics on Hyperliquid stablecoins. This project demonstrates the strengths and trade-offs of each approach in Web3 data indexing.

---

## What Problem This Project Solves

Hyperliquid’s stablecoin ecosystem requires reliable, scalable, and low-latency access to on-chain data across multiple tokens and chains. Traditional subgraphs often face challenges such as:

- Higher latency with increasing event throughput.
- Limited flexibility in combining on-chain and off-chain data.
- Complex infrastructure and maintenance overhead.

This project leverages **Goldsky pipelines** to stream on-chain stablecoin transfer data directly into a PostgreSQL data warehouse, enabling:

- Real-time data access with minimal latency.
- Flexible data enrichment and advanced analytics in your own database.
- Easier scaling and multi-chain, multi-token support.

At the same time, it uses **subgraphs** for parts of the app where structured GraphQL querying is beneficial, demonstrating the pros and cons of each.

---

## Project Architecture

### Goldsky Pipelines (Streaming Approach)

- Stream on-chain token transfer data into PostgreSQL tables per token.
- Supported tokens include `usdxl`, `kei`, `feusd`, `usde`, `ush`, `usr`, `usdhl`, `hbusdt`.
- Data is available in real-time for analytics, notifications, and app consumption.
- Allows customized SQL queries, enriched analytics, and moderate/large workloads.

### Subgraph Components

- Used alongside Goldsky pipelines for GraphQL querying of more static or structured data.
- Provides quick developer experience and integration with existing dApps.
- Great for specific, lower traffic, and tightly scoped queries.

---

## Features

- Real-time streaming and storage of multi-token stablecoin transfers via pipelines.
- PostgreSQL backend running in Docker, accessible via secure tunnels or VPN.
- Configurable subscription-based whale alerts on token transfers.
- Analytical commands like leaderboards, holder distributions, and transfer activity spikes.
- Demo Telegram bot querying pipeline data (optional).

---

## Setup Overview

1. **PostgreSQL Docker Container:**  
   Runs with dedicated persistent storage.

2. **Goldsky Pipelines:**  
   Configure pipeline  with your connection url (project uses postgres SQL)

3. **Data Access:**  
   Connect your analytics tools or apps directly to Postgres for customized queries.

4. **Subgraphs:**  
   Implement or integrate subgraphs for parts of your app needing GraphQL APIs.

5. **Networking:**  
   Use ngrok (development), VPN, or SSH tunnels for database connection.

---

## Why Use Both Pipelines and Subgraphs?

| Feature                     | Goldsky Pipelines                  | Subgraphs                        |
|-----------------------------|----------------------------------|---------------------------------|
| Data Latency                | Low, streaming real-time data     | Moderate, query-based            |
| Data Model                 | Flexible, combines on/off-chain   | Structured for on-chain only    |
| Scalability                | High throughput, multi-chain      | Best for low/moderate traffic   |
| Query Language             | SQL                              | GraphQL                        |
| Infrastructure            | User-managed storage/queries      | Hosted managed indexing         |
| Use Cases                 | Real-time analytics, big data       | Specific dApp or API queries    |

---

## Contact

Open issues or pull requests for questions, improvements, and collaboration.
