import React from 'react';
import ClippedDrawer from './Drawer';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Login';
import AllRepos from './AllRepos';

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/projects" element={<AllRepos />} />
          <Route path="/repo/:reponame" element={<ClippedDrawer />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
