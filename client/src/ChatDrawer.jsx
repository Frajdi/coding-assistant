import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import DirectionsIcon from "@mui/icons-material/Directions";
import { MessageList } from "react-chat-elements";
import "react-chat-elements/dist/main.css";

export default function ChatDrawer() {
  const [messages, setMessages] = useState([
    {
      position: "left",
      type: "text",
      title: "AI",
      text: "Give me a message list example !",
    },
    {
      position: "right",
      type: "text",
      title: "Human",
      text: "That's all.",
    },
  ]);

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
          label="Multiline Placeholder"
          placeholder="Placeholder"
          multiline
          sx={{ m: 4 }}
          InputProps={{
            endAdornment: (
              <>
                <Divider
                  sx={{ height: "100%", m: 0.5, backgroundColor: "#90caf9" }}
                  orientation="vertical"
                />
                <Stack height={"100%"} justifyContent={"flex-end"}>
                  <IconButton color="primary" aria-label="directions">
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
