import React, { useState, useEffect, useRef, useReducer } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import io from "socket.io-client";
import { get_csrf_token } from "../backendRequests/requests";

const ProfileBox = ({ name, onClickCallback = () => {} }) => {
  return (
    <>
      <div
        style={{
          width: "100%",
          color: "white",
          padding: "20px",
          borderBottom: "1px solid black",
          cursor: "pointer",
        }}
        onClick={onClickCallback}
      >
        <p>{name}</p>
      </div>
    </>
  );
};

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);

  const [any, forceUpdate] = useReducer((x) => x + 1, 0);

  const searchInput = useRef();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const connectedListener = async () => {
    setConnected(true);
  };

  const disconnectedListener = async () => {
    setConnected(false);
  };

  useEffect(() => {
    const _socket = io("http://" + document.domain + ":5000/", {
      withCredentials: true,
    });
    setSocket(_socket);

    _socket.on("connect", connectedListener);

    _socket.on("disconnect", disconnectedListener);

    // _socket.on("");

    return () => {
      _socket.off("connect", connectedListener);
      _socket.off("disconnect", disconnectedListener);
      _socket.close();
    };
  }, [setSocket]);

  const handleSearchInputChange = async (e) => {
    const value = e.target.value;
    if (value.trim() === "") {
      setUserSearchResults([]);
      return;
    }
    const results = [];
    if (value.length > 0) {
      fetch("/api/search/" + value.trim() + "/", {
        method: "GET",
        credentials: "include",
      })
        .then((_res) => {
          if (_res.ok) {
            return _res.json();
          } else {
            return new Error("Error searching for users");
          }
        })
        .then((data) => {
          console.log(data);
          setUserSearchResults(data);
        })
        .catch((err) => console.error(err));
    }
  };

  const handleProfileBoxClick = async (e, id) => {
    fetch("/api/add-friend/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": await get_csrf_token(),
      },
      credentials: "include",
      body: JSON.stringify({ id: id }),
    })
      .then((_res) => _res.json())
      .then((data) => {
        if (data["success"] === true) {
          searchInput.current.childNodes[0].value = "";
          setUserSearchResults([]);
          setFriends((friends) => [...friends, data["friend"]]);
          forceUpdate();
        } else {
          return new Error("Error adding friend");
        }
      })
      .catch((e) => console.error(e));
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const renderMainMenu = () => {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            {/* <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton> */}
            {/* the future menu */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Chat-App
            </Typography>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                ref={searchInput}
                onKeyUp={(e) => {
                  handleSearchInputChange(e);
                }}
              />
            </Search>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              {/* <IconButton
                size="large"
                aria-label="show 4 new mails"
                color="inherit"
              >
                <Badge badgeContent={4} color="error">
                  <MailIcon />
                </Badge>
              </IconButton>
              <IconButton
                size="large"
                aria-label="show 17 new notifications"
                color="inherit"
              >
                <Badge badgeContent={17} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton> */}
              {/* will add in the future */}

              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Box>
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MoreIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        {renderMobileMenu}
        {renderMenu}
      </Box>
    );
  };

  const renderFriends = (friends) => {
    console.log("rendering friends.");
    return (
      <>
        {friends.map((friend, index) => {
          console.log("rendering friend " + index);
          return <ProfileBox name={friend.name} key={index} />;
        })}
      </>
    );
  };

  const render = () => {
    console.log("rendering");
    return (
      <>
        {renderMainMenu()}
        <div style={{ height: "calc(100vh - 64px)", width: "100%" }}>
          <Grid container style={{ height: "100%" }}>
            <Grid
              item
              xs={3}
              style={{ backgroundColor: "#1d2229", borderRight: "1px solid" }}
            >
              {userSearchResults.length > 0
                ? userSearchResults.map((user, index) => {
                    console.log("rendering search results");
                    return (
                      <ProfileBox
                        key={index}
                        name={user.name}
                        onClickCallback={(e) => {
                          handleProfileBoxClick(e, user.id);
                        }}
                      />
                    );
                  })
                : renderFriends(friends)}

              {/* <ProfileBox name="amir" /> */}
            </Grid>
            <Grid item xs={9} style={{ backgroundColor: "#1d2229" }}></Grid>
          </Grid>
        </div>
      </>
    );
  };

  return (
    <>
      <Container style={{ height: "100vh" }}>
        {socket && connected ? render() : <div>Loading...</div>}
      </Container>
    </>
  );
};
