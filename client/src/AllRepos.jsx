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
    clearDBGetResponse();
  }, []);

  const clearDBGetResponse = async () => {
    await getResponse();
    await clearDatabase();
  };

  const clearDatabase = async () => {
    const url = "https://localhost:3000/v1/vectorize/truncation";

    try {
      const { data } = await axios.get(url);
      console.log(data);
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };

  const getResponse = async () => {
    const url = "https://localhost:3000/v1/repos";

    try {
      const { data } = await axios.get(url);
      console.log(data.data);
      const repos = data.data.user.repositories.nodes;
      repos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setRepos([...repos]);
      sepparateOwnerData(data.data);
    } catch (error) {
      // Handle errors
      console.error("Error during post request", error);
    }
  };

  const getUploadedRepos = async () => {
    const url = "https://localhost:3000/v1/repos/fetched-repos";
    try {
      const { data } = await axios.get(url);
      console.log(data);
    } catch (error) {
      console.error("Error during post request", error);
    }
  };

  const sepparateOwnerData = (data) => {
    const userName = data.user.name;
    const avatarURL = data.user.avatarUrl;
    const totalRepositories = data.user.repositories.totalCount;
    const followersCount = data.user.followers.totalCount;
    const followingCount = data.user.following.totalCount;

    setOwner({
      userName,
      avatarURL,
      totalRepositories,
      followersCount,
      followingCount,
    });
  };

  useEffect(() => {
    console.log("repos", repos);
    console.log("owner", owner);
  }, [repos, owner]);

  if (!repos && !owner) return "Loading...";

  return (
    <Stack sx={{ padding: "3rem" }} spacing={2}>
      {/* <button
        onClick={() => {
          getUploadedRepos();
        }}
      >
        test
      </button> */}
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
            {repos.map((repo) => {
              console.log(repo);
              return (
                <Grid item xs={12}>
                  <RepoCard repoData={repo} />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default AllRepos;
