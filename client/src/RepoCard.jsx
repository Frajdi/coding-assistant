import React, { useState } from "react";
import {useNavigate} from "react-router-dom"
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import CircularProgress from "@mui/material/CircularProgress";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import PsychologyIcon from "@mui/icons-material/Psychology";
import axios from 'axios';

const buttonSx = {
  "&:hover": {
    bgcolor: "#D2CC74",
  },
};

const RepoCard = ({ repoData }) => {
  const navigate = useNavigate()
  const { languages, name, updatedAt, isPrivate, id } = repoData;

  // console.log(languages, name, updatedAt, isPrivate, id);
  const [loading, setLoading] = useState(false)

  const fillDataBase = async (repoName) => {
    const url = `https://localhost:3000/v1/vectorize/sync-repo`;

    try {
      const response = await axios.post(
        url,
        JSON.stringify({
          repo_name: repoName,
          updatedAt,
          id,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };

  const handlefetchRepo = async(repoName) =>{
    setLoading(true)
      try {
        await fillDataBase(repoName)
        navigate(`/repo/${repoName}`)
      } catch (error) {
        setLoading(false)
        console.log(error);
      }
  } 

  const splitObjectKeysAndValues = (inputObject) => {
    
    // const keysArray = inputObject.nodes.map((node) => node.name)
    console.log('>>', inputObject.nodes);

    return { keys: 'test', values: 3 };
  };

  return (
    <Paper sx={{ width: "100%", padding: 4 }}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={3}
        justifyContent={"space-around"}
      >
        <Stack
          direction={"column"}
          spacing={3}
          justifyContent={"center"}
          alignItems={"flex-start"}
          width={"30%"}
        >
          <Typography variant="h4">{name}</Typography>
          <Chip label={isPrivate ? 'Private' : 'Public'} variant="filled" />
          <Typography sx={{ opacity: 0.4 }}>
            Last Update {updatedAt}
          </Typography>
        </Stack>
        <Box sx={{ width: "50%" }}>
          {/* <SparkLineChart
            colors={["#90caf9"]}
            plotType="bar"
            data={splitObjectKeysAndValues(languages).values}
            showTooltip
            xAxis={{
              scaleType: "band",
              data: splitObjectKeysAndValues(languages).keys,
            }}
            height={100}
          /> */}
        </Box>
        <Box sx={{ m: 1, position: "relative", marginLeft: 5 }}>
          <Fab
            aria-label="save"
            color="primary"
            sx={buttonSx}
            onClick={() => {handlefetchRepo(name)}}
          >
            <PsychologyIcon sx={{ fontSize: "3rem" }} />
          </Fab>
          {loading && (
            <CircularProgress
              size={68}
              sx={{
                color: "#D2CC74",
                position: "absolute",
                top: -6,
                left: -6,
                zIndex: 1,
              }}
            />
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default RepoCard;
