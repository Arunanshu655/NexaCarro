import { useState } from "react";
import { useMutation } from "@apollo/client/react";

import { GET_ORDERS } from "../../graphql/queries/orderQueries";
import { CREATE_RAZORPAY_ORDER } from "../../graphql/mutations/paymentMutations";
import { VERIFY_RAZORPAY_PAYMENT } from "../../graphql/mutations/paymentMutations";
import { LoadRazorpay
    
 } from "../../utils/loadRazorPay";
const PaymentButton = ({
  orderId,
  user,
  onSuccess,
}) => {
  const [processing, setProcessing] = useState(false);

  const [createRazorpayOrder] = useMutation(
    CREATE_RAZORPAY_ORDER
  );

  const [verifyRazorpayPayment] = useMutation(
    VERIFY_RAZORPAY_PAYMENT,
    {
      refetchQueries: [
        {
          query: GET_ORDERS,
        },
      ],
      awaitRefetchQueries: true,
    }
  );

  const handlePayment = async () => {
    try {
      setProcessing(true);

      /*
       * 1. Load Razorpay Checkout
       */
      const loaded = await LoadRazorpay();

      if (!loaded) {
        throw new Error(
          "Unable to load Razorpay Checkout"
        );
      }

      /*
       * 2. Ask backend to create Razorpay order
       */
      const { data } = await createRazorpayOrder({
        variables: {
          orderId,
        },
      });

      const razorpayOrder =
        data?.createRazorpayOrder;

      if (!razorpayOrder) {
        throw new Error(
          "Failed to create Razorpay order"
        );
      }

      /*
       * 3. Configure Razorpay Checkout
       */
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: "NexaCart",

        description: "NexaCart Order",

        order_id: razorpayOrder.id,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },

        theme: {
          color: "#111827",
        },

        /*
         * 4. Payment successful
         */
        handler: async (response) => {
          try {
            console.log(
              "Razorpay response:",
              response
            );

            /*
             * 5. Send payment details
             * to backend for verification.
             */
            const result =
              await verifyRazorpayPayment({
                variables: {
                  orderId,

                  razorpayOrderId:
                    response.razorpay_order_id,

                  razorpayPaymentId:
                    response.razorpay_payment_id,

                  razorpaySignature:
                    response.razorpay_signature,
                },
              });

            const verifiedOrder =
              result?.data?.verifyRazorpayPayment;

            if (!verifiedOrder) {
              throw new Error(
                "Payment verification failed"
              );
            }

            console.log(
              "Payment verified:",
              verifiedOrder
            );

            onSuccess?.(verifiedOrder);

          } catch (error) {
            console.log(
              "Payment verification error:",
              error
            );

            alert(
              "Payment was completed but verification failed. Please contact support."
            );
          }
        },

        modal: {
          ondismiss: () => {
            console.log(
              "Razorpay checkout closed"
            );

            setProcessing(false);
          },
        },
      };

      /*
       * 6. Open Razorpay Checkout
       */
      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "Payment failed:",
            response.error
          );

          alert(
            response.error?.description ||
              "Payment failed"
          );

          setProcessing(false);
        }
      );

      razorpay.open();

    } catch (error) {
      console.error(
        "Payment initialization failed:",
        error
      );

      alert(
        error.message ||
          "Unable to start payment"
      );

      setProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={processing}
      className="
        w-full
        px-5
        py-3
        rounded-full
        bg-gray-900
        text-white
        font-medium
        transition-all
        duration-150
        hover:bg-gray-800
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      {processing
        ? "Processing..."
        : "Pay Now"}
    </button>
  );
};

export default PaymentButton;