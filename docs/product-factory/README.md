# Product Factory Layer

The Product Factory layer is an essential component of the MERCH SHIP architecture, serving as the backbone for product management and creation. This directory contains various modules and files necessary for defining, creating, and managing products within the MERCH SHIP ecosystem.

## Contents of the Product Factory Layer

- **Product Models**: The data structures that define the attributes and behaviors of products.
- **Product Services**: Business logic that applies to products, such as validation and transformations.
- **Utilities**: Helper functions and utilities that assist in product-related operations.
- **Integration Points**: Interfaces for integration with other layers, including inventory and shipping.
- **Governed Content Systems**: Definition-only content products with explicit evidence, rights, delivery, and release boundaries.

## Governed content systems

- [PFU Scary + Faceless Content System v0.2](./pfu-scary-faceless-content-system-v0.2.md) — audited content-production system, 30-day calendar, thumbnail briefs, character universe, offer, funnel, and launch gates.

The content system is **BLUE — definition complete / delivery unverified**. It is not live software, an autonomous agent, automatic publishing, or a performance guarantee.

## Relationship to MERCH SHIP v0.1.0

In version v0.1.0 of MERCH SHIP, the Product Factory layer plays a crucial role in enabling product functionalities. It interacts with the following components:

- **Order Management**: Facilitates product inclusion in orders and tracking.
- **Inventory Management**: Syncs product availability and stock levels.
- **User Interface**: Supplies the necessary data and methods for product display and interaction in the frontend.

This structure provides an organized foundation for managing products. Every operational or commercial capability must still pass its own evidence and release gates.