import { gql } from "@apollo/client";

export const GET_ADMIN_ORDERS = gql`
  query GetAdminOrders {
    adminOrders {
      id
      totalPrice
      status

      payment {
        status
        razorpayOrderId
        razorpayPaymentId
      }

      user {
        id
        name
        email
      }

      items {
        quantity
        price

        product {
          id
          name
          price
        }
      }
    }
  }
`;