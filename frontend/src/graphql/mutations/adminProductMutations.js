import { gql } from "@apollo/client";

export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $description: String!
    $price: Float!
    $stock: Int!
    $category: String!
  ) {
    createProduct(
      name: $name
      description: $description
      price: $price
      stock: $stock
      category: $category
    ) {
      id
      name
      description
      price
      stock
      category
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $productId: ID!
    $name: String
    $description: String
    $price: Float
    $stock: Int
    $category: String
  ) {
    updateProduct(
      productId: $productId
      name: $name
      description: $description
      price: $price
      stock: $stock
      category: $category
    ) {
      id
      name
      description
      price
      stock
      category
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productId: ID!) {
    deleteProduct(productId: $productId)
  }
`;