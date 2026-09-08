import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
mutation SendMessage($chatId: ID!, $text: String!) {

  sendMessage(
    chatId: $chatId,
    text: $text
  ) {

    sender{
      id
      name
    }

    text

    createdAt

  }

}
`;