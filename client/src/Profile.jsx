import React from "react";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

const Profile = ({ owner }) => {
  const {
    userName,
    avatarURL,
    totalRepositories,
    followersCount,
    followingCount,
  } = owner;

  // console.log( userName,
  //   avatarURL,
  //   totalRepositories,
  //   followersCount,
  //   followingCount,);


  return (
    <Paper
      sx={{
        background: "rgba(255, 255, 255, 0.3)",
        boxShadow: "0 0 42px 10px rgb(152,201,228, 0.37)",
        backdropFilter: "blur(8.5px)",
        WebkitBackdropFilter: "blur(8.5px)",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
      }}
    >
      <Paper
        sx={{
          background:
            "radial-gradient(circle at top left, #90caf9, #D2CC74 90%)",
          height: "45%",
          position: "absolute",
          zIndex: -1,
          width: "100%",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          borderRadius: "10px",
        }}
      />

      <Stack
        direction={"column"}
        justifyContent={"flex-start"}
        spacing={2}
        p={4}
        alignItems={"center"}
      >
        <Stack
          direction={"row"}
          justifyContent={"space-around"}
          alignItems={"center"}
          spacing={2}
        >
          <img
            src={avatarURL}
            style={{ width: "50%", borderRadius: "40%", marginTop: "3rem" }}
          />
          <Typography variant="h3" color="rgba(0, 0, 0, 0.5)">
            {userName}
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Stack
              direction={"column"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography variant="h3" color="primary">
                {totalRepositories}
              </Typography>
              <Typography variant="caption" color="primary">
                Repos
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Stack
              direction={"column"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography variant="h3" color="primary">
                {followersCount}
              </Typography>
              <Typography variant="caption" color="primary">
                Followers
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Stack
              direction={"column"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography variant="h3" color="primary">
                {followingCount}
              </Typography>
              <Typography variant="caption" color="primary">
                following
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default Profile;
