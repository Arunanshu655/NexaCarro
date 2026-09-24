import { useMutation } from "@apollo/client/react";
import {
  CalendarDays,
  CircleCheck,
  Clock3,
  Package,
  XCircle,
} from "lucide-react";

import OrderItem from "./OrderItem";
import PaymentButton from '../payment/PaymentButton';


import { CANCEL_ORDER } from "../../graphql/mutations/orderMutations";
import { GET_ORDERS } from "../../graphql/queries/orderQueries";

const OrderCard = ({ order }) => {

  const [cancelOrder, { loading }] =
    useMutation(CANCEL_ORDER, {
      refetchQueries: [
        { query: GET_ORDERS }
      ],
    });

  const handleCancel = async () => {

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {

      await cancelOrder({
        variables: {
          orderId: order.id,
        },
      });

    } catch (err) {

      alert(err.message);

    }
  };

  const getStatusConfig = () => {

    switch (order.status?.toLowerCase()) {

      case "delivered":
        return {
          label: "Delivered",
          className:
            "bg-green-50 text-[var(--success)]",
          icon: CircleCheck,
        };

      case "cancelled":
        return {
          label: "Cancelled",
          className:
            "bg-red-50 text-[var(--danger)]",
          icon: XCircle,
        };
      
      case "paid":
        return {
          label: "paid",
          className:
            "bg-blue-50 text-[var(--success)]",
          icon: CircleCheck,
        };

      case "shipped":
        return {
          label: "Shipped",
          className:
            "bg-blue-50 text-[var(--primary)]",
          icon: Package,
        };

      default:
        return {
          label: order.status || "Processing",
          className:
            "bg-orange-50 text-[var(--warning)]",
          icon: Clock3,
        };
    }
  };

  const status = getStatusConfig();

  const StatusIcon = status.icon;

  return (
    <div className="
      overflow-hidden
      rounded-[10px]
      border border-[var(--border)]
      bg-white
      shadow-sm
    ">

      {/* Header */}
      <div className="
        flex
        flex-col
        gap-4
        border-b border-[var(--border)]
        p-5
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">

        <div>

          <p className="text-xs text-[var(--muted)]">
            Order ID
          </p>

          <p className="
            mt-1
            max-w-[220px]
            truncate
            text-sm
            font-medium
          ">
            {order.id}
          </p>

        </div>

        <div className="flex items-center gap-4">

          {/* Status */}
          <div className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            px-3 py-1.5
            text-xs
            font-medium
            ${status.className}
          `}>

            <StatusIcon size={14} />

            <span>
              {status.label}
            </span>

          </div>

        </div>

      </div>

      {/* Items */}
      <div className="space-y-3 p-5">

        {order.items?.map((item, index) => (
          <OrderItem
            key={item.product?.id || index}
            item={item}
          />
        ))}

      </div>

      {/* Footer */}
      <div className="
        flex
        flex-col
        gap-4
        border-t border-[var(--border)]
        bg-[#FAFAFA]
        p-5
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">

        <div className="flex items-center gap-2">

          <CalendarDays
            size={15}
            className="text-[var(--muted)]"
          />

          <span className="text-xs text-[var(--muted)]">
            Order placed successfully
          </span>

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            {/* Total */}
            <div className="text-right">
              <p className="text-xs text-[var(--muted)]">
                Total
              </p>

              <p className="text-xl font-semibold">
                ₹{order.totalPrice?.toFixed(2)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">

              {/* Pay Now */}
              {order.status?.toLowerCase() === "pending" &&
                order.payment?.status !== "paid" && (
                  <PaymentButton
                    orderId={order.id}
                    user={order.user}
                    onSuccess={(paidOrder) => {
                      console.log(
                        "Payment successful:",
                        paidOrder
                      );
                    }}
                  />
                )}

              {/* Cancel Order */}
              {order.status?.toLowerCase() !== "delivered" &&
                order.status?.toLowerCase() !== "cancelled" && (
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      border
                      border-red-200
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-[var(--danger)]
                      transition-all
                      duration-200
                      hover:bg-red-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <XCircle size={16} />

                    {loading
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </button>
                )}

            </div>

          </div>

      </div>

    </div>
  );
};

export default OrderCard;