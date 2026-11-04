import { gql } from "@apollo/client";

export const GET_ADMIN_PRODUCTS = gql`
  query GetAdminProducts {
    adminProducts {
      id
      name
      description
      price
      stock
      category
      rating
      seller {
        id
        name
        email
      }
    }
  }
`;