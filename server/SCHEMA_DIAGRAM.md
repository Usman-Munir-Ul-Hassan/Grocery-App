# Database Schema & Class Diagram

This document contains the visual entity-relationship and class diagram for the Grocery App backend.

---

## Class & Relationship Diagram

```mermaid
classDiagram
    direction TB

    class User {
        +String username
        +String email
        +UserRole role
        +Boolean isActivated
        +Date createdAt
        +Date updatedAt
    }

    class Customer {
        +String phone
    }

    class DeliveryPartner {
        +String password
        +String phone
        +ILiveLocation liveLocation
        +ObjectId branch
    }

    class Admin {
        +String password
    }

    class Branch {
        +String name
        +ILocation location
        +String address
        +ObjectId[] deliveryPartners
    }

    class Category {
        +String name
        +String image
    }

    class Product {
        +String name
        +String image
        +Number price
        +Number discountPrice
        +ObjectId category
    }

    class Order {
        +String orderId
        +ObjectId customer
        +ObjectId deliveryPartner
        +ObjectId branch
        +OrderItem[] items
        +ILocationPoint deliveryLocation
        +ILocationPoint pickupLocation
        +ILocation deliveryPersonLocation
        +Number totalPrice
        +OrderStatus status
        +Date createdAt
        +Date updatedAt
    }

    class Counter {
        +String name
        +Number sequence_value
    }

    %% Inheritance (User Base Schema)
    User <|-- Customer : destructures / inherits
    User <|-- DeliveryPartner : destructures / inherits
    User <|-- Admin : destructures / inherits

    %% Relationships
    DeliveryPartner "0..*" --> "1" Branch : assigned to
    Branch "1" o-- "0..*" DeliveryPartner : manages

    Product "0..*" --> "1" Category : belongs to

    Order "0..*" --> "1" Customer : placed by
    Order "0..*" --> "0..1" DeliveryPartner : assigned to
    Order "0..*" --> "1" Branch : dispatched from
    Order "1" o-- "1..*" Product : contains items
```

---

## Relationship Overview

1. **User Inheritance**:
   - `Customer`, `DeliveryPartner`, and `Admin` destructure the base `User` schema (`username`, `email`, `role`, `isActivated`).

2. **Branch & Delivery Partner**:
   - Each `DeliveryPartner` points to a `Branch`.
   - Each `Branch` maintains a list of assigned `DeliveryPartner` IDs.

3. **Catalog (Category & Product)**:
   - Each `Product` holds an `ObjectId` reference to its `Category`.

4. **Order Lifecycle**:
   - An `Order` references the `Customer` who ordered, the `Branch` it will be fulfilled from, and the `DeliveryPartner` assigned to deliver it.
   - The `Order` embeds an array of item references (`Product`) along with each item's quantity (`count`).
