import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import DirectionsIcon from "@mui/icons-material/Directions";
import { MessageList } from "react-chat-elements";
import axios from "axios";
import "react-chat-elements/dist/main.css";

export default function ChatDrawer() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (messages.length) {
      const latestMessage = messages[messages.length - 1];

      if (latestMessage.title === "Human") {
        //do the formating here not in the backend
        getResponse(latestMessage.text, formatConversation(messages));
      }
    }
  }, [messages]);

  const formatConversation = (conversation) => {
    const formatedConversation = conversation.map((message) => {
      return `${message.title}: ${message.text}`;
    });

    return formatedConversation;
  };

  const getResponse = async (question, conv_history) => {
    const url = "https://localhost:3000/v1/ai";

    try {
      const { data } = await axios.post(
        url,
        JSON.stringify({
          question,
          conv_history,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const formatedResponse = {
        position: "left",
        type: "text",
        title: "AI",
        text: data.answer,
      };

      setMessages((prev) => [...prev, formatedResponse]);
      console.log("Post request successful", response.data);
    } catch (error) {
      // Handle errors
      console.error("Error during post request", error);
    }
  };

  const handleNewMessage = () => {
    if (inputValue) {
      setMessages((prev) => [
        ...prev,
        {
          position: "right",
          type: "text",
          title: "Human",
          text: inputValue,
        },
      ]);
      setInputValue("");
    }
  };

  return (
    <>
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: 500,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 400,
            boxSizing: "border-box",
          },
        }}
        slotProps={{
          content: {
            sx: {
              bgcolor: "transparent",
              p: { md: 3, sm: 0 },
              boxShadow: "none",
            },
          },
        }}
      >
        <Box
          whiteSpace={3}
          sx={{
            overflowY: "auto",
            height: "100%",
            paddingTop: "5rem",
            paddingBottom: "1rem",
            color: "black",
            backgroundColor: "#272727",
          }}
        >
          <MessageList
            className="message-list"
            messageBoxStyles={{
              backgroundColor: "#E5E4E2",
              color: "#121212",
            }}
            notchStyle={{ fill: "#E5E4E2", color: "#121212" }}
            lockable={true}
            toBottomHeight={50}
            dataSource={messages}
          />
        </Box>
        <TextField
          width={"100%"}
          label="Type your question"
          placeholder="Placeholder"
          multiline
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleNewMessage();
            }
          }}
          sx={{ m: 4 }}
          InputProps={{
            endAdornment: (
              <>
                <Divider
                  sx={{ height: "100%", m: 0.5, backgroundColor: "#90caf9" }}
                  orientation="vertical"
                />
                <Stack height={"100%"} justifyContent={"flex-end"}>
                  <IconButton
                    onClick={() => {
                      handleNewMessage();
                    }}
                    color="primary"
                    aria-label="directions"
                  >
                    <DirectionsIcon />
                  </IconButton>
                </Stack>
              </>
            ),
          }}
        ></TextField>
      </Drawer>
    </>
  );
}
