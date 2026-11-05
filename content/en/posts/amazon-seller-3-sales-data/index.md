---
title: '[3/5] Your Amazon Sales Data at a Glance'
published: 2026-11-05T11:00:00+09:00
description: 'Seller Central Helper gathers inventory, order and sales reports and turns them into one morning to-do page. Here are its data features.'
tags: [Amazon, Seller Central Helper, Inventory, Reports]
category: Amazon Seller
draft: false
---

## Seller Central Helper: your morning to-do list on one page

This is the program that replaces the ‘six menus, many reports, long waits’ from the last post. It runs on your own PC, gathers the reports into Excel, and tells you what needs doing now, ranked P0 to P3.

It works in two ways.

- **Amazon's official API (SP-API) first** — inventory, orders, finance and Buy Box data come straight from the API, without opening a page.
- **A browser for pages the API doesn't cover** — for pages such as the report center, it downloads reports in the browser, the same way a seller would, with generous pauses between clicks so it never puts load on Amazon's site.

![Seller Central Helper main window](./helper-log.png)

*The Seller Central Helper main window. Pick a feature on the left, or tick several to run in order; the run log and result files appear on the right (the program's screens are in Korean).*

## The data features at a glance

Each feature produces one Excel report, with a ‘Needs attention’ sheet up front so you can act right away.

| Feature                    | What it gathers                                                                    | What it tells you                                                                       |
|----------------------------|------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| Account health             | Account Health score, metrics and policy compliance, claims, Voice of the Customer | Only new issues (an issue register removes repeats), score trend                        |
| All listings               | All Listings Report                                                                | Inactive, incomplete and unpriced listings                                              |
| FBA inventory              | FBA inventory report, FBA dashboard, inbound shipments                             | Stock-outs, low stock, restock needs, aged-inventory surcharges, short inbound receipts |
| Order report               | Orders (US Central time), returns                                                  | Change vs the previous period, SKUs with high returns, orders near their ship-by date   |
| Business report            | Sessions, conversion and Buy Box by child ASIN                                     | High-traffic, low-conversion ASINs; drops of 30% or more                                |
| Finance and reimbursements | 18 months of inventory ledger, reimbursements, refunds, FBA fees                   | Lost or damaged stock never reimbursed; refunds never returned                          |

Each report is fetched once a day. If Seller Central already has today's report, the program downloads it instead of requesting a new one.

![FBA inventory report, Needs attention](./fba-needs-attention.png)

*The ‘Needs attention’ sheet of the FBA inventory report: stock-outs, low stock and slow movers ranked by priority, with the action in the right-hand column. The program's reports are in Korean (SKU, ASIN and product names masked).*

## Daily auto-run and Today's Summary

Schedule a time, and every day the program runs the features above in order and wraps the results into one page, Today's Summary. If one feature fails the rest still run, and a desktop notification shows the most urgent item when it finishes.

| Level | Meaning            | Examples                                                       |
|-------|--------------------|----------------------------------------------------------------|
| P0    | Today              | Policy violation; out of stock while selling                   |
| P1    | This week          | Buy Box lost; lost stock eligible for reimbursement; low stock |
| P2    | When you have time | Falling conversion; aged inventory                             |
| P3    | For reference      | Token renewal reminder; improvement ideas                      |

Items of the same kind are grouped into one line, such as ‘12 SKUs low on stock’, so this one page is all you read in the morning. The same summary also appears on the program's Today's Summary tab.

![The program's Today's Summary tab](./helper-today.png)

*The program's Today's Summary tab: counts by level, the features run today and how long each took (43 minutes in total), and the to-dos with how to handle them (sales figures, SKUs and ASINs masked).*

![Today's Summary](./todays-summary.png)

*Part of Today's Summary as saved to Excel: home-screen figures at the top, today's to-dos and how to handle them below (sales, SKUs and ASINs masked).*

## Your data stays on your PC

- **Runs only on your PC** — sales data is saved only as Excel files on your computer and is never sent to any server other than Amazon's.
- **Secrets are encrypted** — API keys and sign-in data are stored with Windows account encryption or in the Mac Keychain.
- **Read-only** — the data features change nothing. Listing and price edits apply only what the seller reviews and selects (covered in part 5).
- **Windows and Mac** — double-click the setup file to install what it needs; it works whether Seller Central is in English, Korean or Chinese.

The next post covers where money leaks fastest: advertising.

---

**Amazon seller series**

1. [Anyone Can Become an Amazon Seller](../amazon-seller-1-getting-started/) — registering, listing and starting to sell
2. [The Real Challenge After You Start Selling](../amazon-seller-2-real-challenge/) — you can't watch every product, and Seller Central is complex
3. **Your Amazon Sales Data at a Glance** — inventory, orders and revenue (this post)
4. [Your Amazon Ads at a Glance](../amazon-seller-4-ads/) — ad analysis and suggested actions
5. [Your Amazon Listings at a Glance](../amazon-seller-5-listings/) — checks and edits
