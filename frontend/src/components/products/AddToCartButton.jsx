import { useMutation } from "@apollo/client/react";

import { ADD_TO_CART } from "../../graphql/mutations/cartMutations";
import { GET_CART } from "../../graphql/queries/cartQueries";
import Button from "../ui/Button";
const AddToCartButton = ({ productId , quantity=1}) => {

    const [addToCart, { loading }] =
        useMutation(ADD_TO_CART, {
            refetchQueries: [{ query: GET_CART }],
            awaitRefetchQueries: true,
        });

    const handleAdd = async () => {

        try {

            await addToCart({

                variables: {
                    productId,
                    quantity: 1
                }

            });

            alert("Added to Cart");

        }

        catch (err) {

            alert(err.message);

        }

    };

    return (

        <Button
            disabled={loading}
            onClick={handleAdd}
        >

            {loading
                ? "Adding..."
                : "Add to Cart"
            }

        </Button>

    );

};

export default AddToCartButton;