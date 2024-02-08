import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import axios from "axios";
import ChatDrawer from "./ChatDrawer";

const drawerWidth = 300;

export default function ClippedDrawer() {
  const [allPaths, setAllPaths] = useState(null);
  const [fullData, setFullData] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);
  const [currentContent, setCurrentContent] = useState(null);
  const { reponame } = useParams();

  useEffect(() => {
    fetchFolderStructure();
  }, []);

  useEffect(() => {
    if (currentPath && fullData) {
      console.log(fullData);
      handleContentChange();
    }
  }, [currentPath]);

  const fetchFolderStructure = async () => {
    try {
      const { data } = await axios.get(
        `https://localhost:3000/v1/repos/${reponame}`
      );
      console.log(data);
      setFullData(data);
      const paths = data.map((item) => item.path);
      setAllPaths(paths);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handlePathChange = (_, path) => {
    console.log(path);
    const pathParts = path.split("+");
    const fullPathParts = pathParts[0].split("/");
    if (
      fullPathParts[fullPathParts.length - 1] ===
      pathParts[pathParts.length - 1]
    ) {
      setCurrentPath(path.split("+")[0]);
    }
  };

  const handleContentChange = () => {
    const currentFile = fullData.find((item) => item.path === currentPath);
    if (currentFile?.content) {
      setCurrentContent(currentFile.content);
    }
  };

  const buildTree = (paths) => {
    const tree = {
      id: reponame,
      name: reponame,
      children: [],
    };

    let counter = 1;

    paths.forEach((path) => {
      const parts = path.split("/");
      let currentLevel = tree;

      parts.forEach((part) => {
        const existingNode = currentLevel.children.find(
          (node) => node.name === part
        );

        if (existingNode) {
          currentLevel = existingNode;
        } else {
          const newNode = {
            id: `${path}+${part}`,
            name: part,
            children: [],
          };
          currentLevel.children.push(newNode);
          currentLevel = newNode;
        }
      });
    });

    // Sort the children based on folder or file and then by name
    tree.children.sort((a, b) => {
      const isFolderA = a.children.length > 0;
      const isFolderB = b.children.length > 0;

      if (isFolderA && !isFolderB) {
        return -1;
      }

      if (!isFolderA && isFolderB) {
        return 1;
      }

      // If both are folders or files, use alphabetical order
      return a.name.localeCompare(b.name);
    });

    return tree;
  };

  const treeData = allPaths ? buildTree(allPaths) : null;

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id.toString()} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              width={"100%"}
            >
              <Typography variant="h6" noWrap component="div">
                AI CODING ASSISTANT
              </Typography>
            </Stack>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto", height: "100%" }}>
            {allPaths && (
              <TreeView
                aria-label="file system navigator"
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                sx={{
                  height: "100%",
                  flexGrow: 1,
                  maxWidth: 400,
                  overflowY: "auto",
                }}
                onNodeSelect={handlePathChange}
              >
                {renderTree(treeData)}
              </TreeView>
            )}
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {/* <div>{createReactElements(currentContent)}</div> */}
          {!currentContent ? (
            <Typography>Welcome To Coding Assistant Ai</Typography>
          ) : (
            currentContent.split("@newLine@").map((line) => {
              console.log(line);
              if (!line) return;
              return (
                <Typography m={0} color="primary">
                  <pre style={{ margin: 0 }}>{line}</pre>
                </Typography>
              );
            })
          )}
          {/* <Typography paragraph>{currentContent}</Typography> */}
        </Box>
      </Box>
      <ChatDrawer />
    </>
  );
}
