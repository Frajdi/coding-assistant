import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AppsIcon from "@mui/icons-material/Apps";
import Profile from "./Profile";
import RepoCard from "./RepoCard";
import axios from "axios";

const AllRepos = () => {
  const [repos, setRepos] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    getResponse();
  }, []);

  const getResponse = async (question, conv_history) => {
    const url = "https://localhost:3000/v1/repos";

    try {
      const { data } = await axios.get(url);
      setRepos(data.repositories);
      sepparateOwnerData(data);
    } catch (error) {
      // Handle errors
      console.error("Error during post request", error);
    }
  };

  const sepparateOwnerData = (data) => {
    const userName = data.user;

    const repoData = data.repositories.find(
      (repo) => repo.owner.login === userName
    );

    setOwner(repoData.owner);
  };

    if(!repos && !owner) return "Loading..."

  return (
    <Stack sx={{ padding: "3rem" }} spacing={2}>
      <Stack spacing={2} direction={"row"}>
        <AppsIcon sx={{ fontSize: "3rem" }} color="primary" />
        <Typography variant="h3" color="primary">
          Repositories
        </Typography>
      </Stack>
      <Divider
        sx={{
          border: "3px solid",
          borderImage: "linear-gradient(to right, #90caf9, #d2cc74) 4",
        }}
      />
      <Grid container spacing={6}>
        <Grid item xs={3}>
          <Profile owner={owner} />
        </Grid>
        <Grid item xs={9} padding={10}>
          <Grid container spacing={3} justifyContent={"space-around"}>
            {repos.map((repo) => (
              <Grid item xs={12}>
                <RepoCard repoData={repo} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default AllRepos;
