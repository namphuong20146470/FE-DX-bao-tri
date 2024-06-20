import { makeStyles } from "@material-ui/core/styles";
import Feature from "components/common/Feature"
import "./Home.css";
import {  Box } from '@mui/material';
import Hero from "components/common/Hero"
const useStyles = makeStyles({
  root: {
    maxHeight: 100,
    marginBottom: 15,
  },
});

function Home(props) {
  const classes = useStyles();
  return (
    <Box className={classes.root}  sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Box sx={{ flex: 1 }}>
            <Hero />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Feature />
          </Box>
    </Box>
  );
}

export default Home;
