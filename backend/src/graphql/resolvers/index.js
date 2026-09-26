// resolvers/index.js
//module imports
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
//model imports
import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Cart from "../../models/Cart.js";
import Order from "../../models/Order.js";
import Review from "../../models/Review.js";
import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";
import razorpay from "../../config/razorpay.js";

export default {
  Query: {
    //1
    test: () => "Hello, GraphQL!",
    //2
    products: () => Product.find().lean().exec(),
    //3
    product: async (_, { id }) =>{
      try {
        // console.log(typeof(id))

        const objectId = new mongoose.Types.ObjectId(id);
        // console.log(typeof(objectId))
        return await Product.findById(objectId);
      } catch (err) {
        // console.log(err)
        throw new Error("Invalid product ID format");
      }
    }, 
    //4
    cart: async (_, __, { user }) => {

      if (!user) throw new Error("Unauthorized");

        const userCart =  await Cart.findOne({ user: user.id })
        .populate("items.product").populate("user");
      
      // if(!userCart.data.cart) return {"message":"No items in your Cart"}
      return userCart;
    },
    //5
    orders: async (_, __, { user }) => {
      if(!user) throw new Error("Unauthorized");
      
      return Order.find({ user: user.id })
        .populate("items.product").populate("user")
        .lean()
        .exec();
    },
    //6
    reviews: async (_, { productId }) => {

      return await Review.find({
        product: productId
      })
      .populate("user")
      .populate("product");
    },
    //7
    myChats: async (_, __, { user }) => {

      if (!user) {
        throw new Error("Unauthorized");
      }

      return await Chat.find({
        users: user.id
      })
      .populate("users", "name email");
    },
    //8
    chat: async (_, { chatId }, { user }) => {

      if (!user) {
        throw new Error("Unauthorized");
      }

      const chat = await Chat.findById(chatId)
        .populate("users", "name email");

      if (!chat) {
        throw new Error("Chat not found");
      }

      return chat;
    },
    me: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");

      return await User.findById(user.id);
    },
  },

  Mutation: {
    //1
    register: async (_, { name, email, password, role }) => {
      const hash = await bcrypt.hash(password, 10);
      return await User.create({ name, email, password: hash, role: role || 'buyer' });
    },
    //2
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
          throw new Error("User not found");
      }
      console.log("user logging.....")
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) throw new Error("Password mismatch with user");

      const res = jwt.sign( 
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        });
      return res;
    },
    //3
    addProduct: async (_, { name, price, description, seller},{user}) => {
      if (!user) throw new Error("Unauthorized");
      
      const dbUser = await User.findById(user.id);

      if(!dbUser) throw new Error("User not found");
      if (dbUser.role !== "seller") throw new Error("Only sellers can add products");
      return await Product.create({ name, price, description, seller });
    },

    // CART MUTATIONS****************************

    //add product to cart******************************************
    //4
    addToCart: async (_, { productId, quantity }, { user }) => {

      if (!user) throw new Error("Unauthorized");

      let cart = await Cart.findOne({ user: user.id });

      // create cart if doesn't exist
      if (!cart) {
        cart = await Cart.create({
          user: user.id,
          items: []
        });
      }

      // check existing product
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          quantity
        });
      }

      await cart.save();

      return await cart.populate("items.product");
    },
    //remove product from cart******************************************

    //5
    removeFromCart: async (_, { productId }, { user }) => {
      if (!user) throw new Error("Unauthorized");
      const cart = await Cart.findOne({ user: user.id });

      if (!cart) throw new Error("Cart not found"); 
      cart.items = cart.items.filter(
        item => item.product.toString() !== productId
      );
      await cart.save();
      return await cart.populate("items.product");
    },
    //update cart quantity******************************************

    //6
    updateCartQuantity: async (_, { productId, quantity }, { user }) => {
      if (!user) throw new Error("Unauthorized");
      const cart = await Cart.findOne({ user: user.id });

      if (!cart) throw new Error("Cart not found");

      const item = cart.items.find(
        i => i.product.toString() === productId
      );

      if (!item) throw new Error("Item not found in cart");
      
      if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }


      item.quantity = quantity;
      await cart.save();
      return await cart.populate("items.product");
    },
    //creates order*********************************************

    //7
    createOrder: async (_, __, { user }) => {

  if (!user) throw new Error("Unauthorized");

  const cart = await Cart.findOne({ user: user.id })
    .populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  let total = 0;

  const orderItems = cart.items.map(item => {

    total += item.product.price * item.quantity;

    return {
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    };
  });

  
  // clear cart after order
  
  const order = await Order.create({
    user: user.id,
    items: orderItems,
    totalPrice: total
  })
  // .populate("items.product").populate("user");
  
  cart.items = [];
  await cart.save();
},
    //cancel order*********************************************

    //8
    cancelOrder: async(_,{orderId}, {user}) =>{
      if(!user) throw new Error("unauthorized")

      const order = await Order.findById(orderId)

      console.log("order : " + order)
      if(order.status === 'delivered') throw new Error("order is placed")
        

      // console.log(order.user+" "+ user.id)
      if(order.user.toString() === user.id){
        order.status = "cancelled";

        await order.save();

        return (await order.populate("items.product")).populate("user");
      }else{
        throw new Error("This is not your order")
      }
    },

    //9
    addReview: async (_, { productId, rating, comment }, { user }) => {

      if (!user) {
        throw new Error("Unauthorized");
      }

      // validate rating
      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // check product exists
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      // optional: prevent duplicate review
      const existingReview = await Review.findOne({
        user: user.id,
        product: productId
      });

      if (existingReview) {
        throw new Error("You already reviewed this product");
      }

      const review = await Review.create({
        user: user.id,
        product: productId,
        rating,
        comment
      });

      return await review.populate("user product");
    },

    //10
    createChat: async (_, { userId }, { user }) => {

      if (!user) {
        throw new Error("Unauthorized");
      }

      // prevent self-chat
      if (user.id === userId) {
        throw new Error("Cannot chat with yourself");
      }

      // check existing chat
      let existingChat = await Chat.findOne({
        users: {
          $all: [user.id, userId]
        }
      })
      .populate("users");

      if (existingChat) {
        return existingChat;
      }

      const chat = await Chat.create({
        users: [user.id, userId]
      });

      return await chat.populate("users");
    },

    //11
    sendMessage: async (_, { chatId, text }, { user }) => {

      if (!user) {
        throw new Error("Unauthorized");
      }

      const chat = await Chat.findById(chatId);

      if (!chat) {
        throw new Error("Chat not found");
      }

      // verify user belongs to chat
      const isMember = chat.users.some(
        u => u.toString() === user.id
      );

      if (!isMember) {
        throw new Error("Not part of this chat");
      }
    
      const message = await Message.create({
        chat: chatId,
        sender: user.id,
        text
      });

      chat.lastMessage = message.id;
      await chat.save();

      return await message.populate("sender", "name");
    },
    //12
    createRazorpayOrder: async (_, { orderId }, { user }) => {
      if (!user) {
        throw new Error("Unauthorized");
      }

      /*
      * Find the NexaCarro order.
      */
      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      /*
      * Make sure this order belongs to
      * the currently authenticated user.
      */
      if (order.user.toString() !== user.id) {
        throw new Error("This is not your order");
      }

      /*
      * Don't create another Razorpay order
      * if one already exists.
      */
      if (order.payment?.razorpayOrderId) {
        return {
          id: order.payment.razorpayOrderId,
          amount: Math.round(order.totalPrice * 100),
          currency: "INR",
        };
      }

      /*
      * Don't allow payment for an already
      * cancelled order.
      */
      if (order.status === "cancelled") {
        throw new Error("Cannot pay for a cancelled order");
      }

      /*
      * Razorpay expects amount in the smallest
      * currency unit.
      *
      * ₹500 -> 50000 paise
      */
      const amount = Math.round(order.totalPrice * 100);

      if (amount <= 0) {
        throw new Error("Invalid order amount");
      }

      /*
      * Create Razorpay order.
      */
      const razorpayOrder = await razorpay.orders.create({
        amount,
        currency: "INR",

        /*
        * Receipt can be your MongoDB order ID.
        */
        receipt: order._id.toString(),

        notes: {
          nexacartOrderId: order._id.toString(),
          userId: user.id,
        },
      });

      /*
      * Save Razorpay order ID in MongoDB.
      */
      order.payment = {
        status: "pending",
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: null,
      };

      await order.save();

      return {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      };
    },
    //13
    verifyRazorpayPayment: async (
      _,
      {
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
      { user }
    ) => {
      if (!user) {
        throw new Error("Unauthorized");
      }

      /*
      * Find NexaCarro order.
      */
      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      /*
      * Make sure this order belongs
      * to the authenticated user.
      */
      if (order.user.toString() !== user.id) {
        throw new Error("This is not your order");
      }

      /*
      * Make sure the Razorpay order ID
      * belongs to this NexaCarro order.
      */
      if (
        order.payment?.razorpayOrderId !==
        razorpayOrderId
      ) {
        throw new Error(
          "Razorpay order does not match"
        );
      }

      /*
      * Generate expected signature.
      *
      * Razorpay signature:
      *
      * HMAC_SHA256(
      *   razorpayOrderId + "|" + razorpayPaymentId,
      *   razorpaySecret
      * )
      */
      const generatedSignature = crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpayOrderId}|${razorpayPaymentId}`
        )
        .digest("hex");

      /*
      * Timing-safe comparison.
      */
      const isValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpaySignature)
      );

      if (!isValid) {
        throw new Error("Invalid payment signature");
      }

      /*
      * Payment is verified.
      */
      order.payment.status = "paid";
      order.payment.razorpayPaymentId =
        razorpayPaymentId;

      /*
      * Your existing order status.
      *
      * You can later introduce a separate
      * fulfillment status if required.
      */
      order.status = "paid";

      await order.save();

      return await order
        .populate("user")
        .then((result) =>
          result.populate("items.product")
        );
    },

  },
  Chat: {
    messages: async (parent) => {
      return await Message.find({ chat: parent.id })
        .populate("sender", "name")
        .sort({ createdAt: 1 });
    }
  },
  Product: {
      reviews: async (parent) => {

      return await Review.find({
        product: parent.id
      })
      .populate("user", "name");
    }
  }

};