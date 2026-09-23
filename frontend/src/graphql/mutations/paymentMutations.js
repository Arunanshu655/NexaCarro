import { gql } from "@apollo/client";

export const CREATE_RAZORPAY_ORDER = gql`
  mutation CreateRazorpayOrder($orderId: ID!) {
    createRazorpayOrder(orderId: $orderId) {
      id
      amount
      currency
    }
  }
`;

export const VERIFY_RAZORPAY_PAYMENT = gql`
  mutation VerifyRazorpayPayment(
    $orderId: ID!
    $razorpayOrderId: String!
    $razorpayPaymentId: String!
    $razorpaySignature: String!
  ) {
    verifyRazorpayPayment(
      orderId: $orderId
      razorpayOrderId: $razorpayOrderId
      razorpayPaymentId: $razorpayPaymentId
      razorpaySignature: $razorpaySignature
    ) {
      id
      status
      totalPrice

      payment {
        status
        razorpayOrderId
        razorpayPaymentId
      }
    }
  }
`;