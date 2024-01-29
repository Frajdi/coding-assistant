import React from "react";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import CircularProgress from "@mui/material/CircularProgress";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import PsychologyIcon from "@mui/icons-material/Psychology";

const buttonSx = {
  "&:hover": {
    bgcolor: "#D2CC74",
  },
};

const RepoCard = ({ repoData }) => {
  const { languages, name, updated_at, visibility } = repoData;
  const loading = false;

  const splitObjectKeysAndValues = (inputObject) => {
    const keysArray = Object.keys(inputObject);
    const valuesArray = Object.values(inputObject);

    return { keys: keysArray, values: valuesArray };
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
          <Chip label={visibility} variant="filled" />
          <Typography sx={{ opacity: 0.4 }}>
            Last Update {updated_at}
          </Typography>
        </Stack>
        <Box sx={{ width: "50%" }}>
          <SparkLineChart
            colors={["#90caf9"]}
            plotType="bar"
            data={splitObjectKeysAndValues(languages).values}
            showTooltip
            xAxis={{
              scaleType: "band",
              data: splitObjectKeysAndValues(languages).keys,
            }}
            height={100}
          />
        </Box>
        <Box sx={{ m: 1, position: "relative", marginLeft: 5 }}>
          <Fab
            aria-label="save"
            color="primary"
            sx={buttonSx}
            onClick={() => {}}
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
