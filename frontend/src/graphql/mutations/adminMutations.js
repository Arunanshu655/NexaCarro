import { gql } from "@apollo/client";

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus(
    $orderId: ID!
    $status: String!
  ) {
    updateOrderStatus(
      orderId: $orderId
      status: $status
    ) {
      id
      status
      totalPrice

      payment {
        status
      }

      user {
        id
        name
        email
      }
    }
  }
`;