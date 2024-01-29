import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";

const Login = () => {
  return (
    <Stack
      alignItems={"center"}
      justifyContent={"center"}
      width={"100vw"}
      height={"100vh"}
      spacing={8}
    >
      <Stack spacing={2}>
        <Typography variant="h2">Login to Your Account</Typography>
        <Typography variant="h6" sx={{ opacity: 0.5 }}>
          Access your Github repos and Work With your personal AI Assistant
        </Typography>
      </Stack>

      <Stack
        component={Link} // Use Link component
        href="https://localhost:3000/v1/auth/github"
        onClick={console.log('hello')}
        sx={{
          borderRadius: "10%",
          textDecoration: 'none',
          color: "white",
          border: "10px solid",
          borderImage: "linear-gradient(to right, #d2cc74, #00c299) 2",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          cursor: "pointer",
          transition: "border-width 0.3s", // Add a transition for a smooth effect
          "&:hover": {
            border: "10px solid #d2cc74", // Adjust the border width on hover
          },
        }}
        spacing={2}
      >
        <GitHubIcon sx={{ fontSize: "10rem" }} />
        <Typography variant="h4">Sign In</Typography>
      </Stack>
    </Stack>
  );
};

export default Login;
