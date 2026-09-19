 //typeDefs/index.js
import { gql } from "apollo-server-express";

export default gql`

  type User {
    id: ID!
    name: String
    email: String
    role: String
  }

  type Product {
    id: ID!
    name: String
    price: Float
    description: String
    reviews: [Review]
  }

  type CartItem {
    product: Product
    quantity: Int
  }

  type Cart {
    id: ID!
    user: User
    items: [CartItem]
  }

  type OrderItem {
    product: Product
    quantity: Int
    price: Float
  }
  
  type Message {
  id: ID!
  sender: User
  text: String
  createdAt: String
  }

  type Payment {
    status: String
    razorpayOrderId: String
    razorpayPaymentId: String
  }

  type Order {
    id: ID!
    user: User
    items: [OrderItem]
    totalPrice: Float
    status: String
    payment: Payment
  }
      
  type Review{
      id : ID!
      user: User
      product: Product
      rating: Int
      comment: String
  }

  type Chat {
      id: ID!
      users: [User]
      messages: [Message]
  }
  
  type RazorpayOrderResponse {
    id: String!
    amount: Int!
    currency: String!
  }

  type Query {
    test: String  # 1
    products: [Product]  #2
    product(id: ID!): Product  #3
    cart: Cart  #4
    orders: [Order]   #5
    reviews(productId: ID!): [Review]  #6
    myChats: [Chat]  #7
    chat(chatId: ID!): Chat  #8
    me: User  #9
  }



  type Mutation {

    # Auth motations
    # 1
    register(name: String!, email: String!, password: String!, role: String): User
    # 2
    login(email: String!, password: String!): String
    # 3
    addProduct(name: String!, price: Float!, description: String): Product
    
    # Cart mutations
    # 4
    addToCart(productId: ID!, quantity: Int!): Cart
    # 5
    removeFromCart(productId: ID!): Cart
    # 6
    updateCartQuantity(
      productId: ID!
      quantity: Int!
    ): Cart
    # 7
    createOrder: Order

    #8
    cancelOrder(orderId : ID!): Order
    
    #9
    addReview(productId: ID!, rating: Int, comment: String) : Review

    #10
    createChat(userId: ID!): Chat
    #11
    sendMessage(
      chatId: ID!
      text: String!
    ): Message
    
    #12
  createRazorpayOrder(orderId: ID!): RazorpayOrderResponse

      verifyRazorpayPayment(
        orderId: ID!
        razorpayOrderId: String!
        razorpayPaymentId: String!
        razorpaySignature: String!
      ): Order
    
    
    }
`;