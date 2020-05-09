import React, { useEffect, useState } from "react";
import {
	AppBar,
	Badge,
	CssBaseline,
	Container,
	CircularProgress,
	Checkbox,
	FormControlLabel,
	Typography,
	Tab,
	Tabs,
	TextField,
	makeStyles,
	Button,
} from "@material-ui/core";

import JokeCard from "./JokeCard";

const useStyles = makeStyles({
	form: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
});

function Spinner() {
	return (
		<div style={{ textAlign: "center", padding: "2rem" }}>
			<CircularProgress />
		</div>
	);
}

function App() {
	useEffect(() => {
		getJokes();
		getCategories();
	}, []);

	const classes = useStyles();

	const [jokes, setJokes] = useState([]);
	const [categories, setCategories] = useState([]);
	const [filterCategories, setFilterCategories] = useState([]);
	const [jokesToShow, setJokesToShow] = useState([]);
	const [likedJokes, setLikedJokes] = useState([]);
	const [currentTab, setCurrentTab] = useState(0);
	const [loading, setLoading] = useState(false);

	const [firstName, setFirstName] = useState("Chuck");
	const [lastName, setLastName] = useState("Norris");

	useEffect(() => {
		const bottomJokeEl = document.getElementById(
			`joke-${jokesToShow.length - 1}`
		);
		observeElement(bottomJokeEl);
	}, [jokesToShow]);

	const getJokes = () => {
		setLoading(true);
		fetch(
			`https://api.icndb.com/jokes?firstName=${firstName}&lastName=${lastName}`
		)
			.then((res) => res.json())
			.then((res) => {
				setJokes(res.value);
				setJokesToShow(res.value.slice(0, 10));
				setLoading(false);
			})
			.catch((err) => console.log(err));
	};

	const getCategories = () => {
		fetch("https://api.icndb.com/categories")
			.then((res) => res.json())
			.then((res) => {
				setCategories(res.value);
				setFilterCategories(res.value);
			})
			.catch((err) => console.log(err));
	};

	const addMoreJokes = () => {
		setLoading(true);
		setTimeout(() => {
			setJokesToShow(jokes.slice(0, jokesToShow.length + 10));
			setLoading(false);
		}, 500);
	};

	const observeElement = (bottomJoke) => {
		if (!bottomJoke) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting === true) {
					addMoreJokes();
					observer.unobserve(bottomJoke);
				}
			},
			{ threshold: 1 }
		);
		observer.observe(bottomJoke);
	};

	const changeTab = (event, value) => {
		setCurrentTab(value);
	};

	const likeJoke = (id) => {
		if (likedJokes.find((joke) => joke.id === id)) return;
		const likedJoke = jokes.find((joke) => joke.id === id);
		setLikedJokes([likedJoke, ...likedJokes]);
	};

	const unlikeJoke = (id) => {
		const newLikedJokes = likedJokes.filter((joke) => joke.id !== id);
		setLikedJokes(newLikedJokes);
	};

	const togleCategory = (e) => {
		const category = e.target.name;
		if (filterCategories.includes(category)) {
			const filterCategoriesCopy = [...filterCategories];
			const categoryIndex = filterCategoriesCopy.indexOf(category);
			filterCategoriesCopy.splice(categoryIndex, 1);
			setFilterCategories(filterCategoriesCopy);
		} else {
			setFilterCategories([...filterCategories, category]);
		}
	};

	const categoryMatch = (jokeCategories) => {
		for (let i = 0; i < jokeCategories.length; i++) {
			if (filterCategories.includes(jokeCategories[i])) return true;
		}
		return false;
	};

	const changeName = (e) => {
		e.preventDefault();
		if (firstName === "" || lastName === "") return;
		getJokes();
	};

	return (
		<div className="App">
			<CssBaseline />
			<Container>
				<Typography variant="h2" align="center" style={{ margin: 20 }}>
					Chuck Norris Jokes
				</Typography>

				<AppBar position="sticky" style={{ marginBottom: 20 }}>
					<Tabs value={currentTab} onChange={changeTab} centered>
						<Tab label="Home" id="home-tab" aria-controls="home-panel" />
						<Tab
							label={
								<Badge
									color="secondary"
									badgeContent={likedJokes.length ? likedJokes.length : null}
								>
									Likes
								</Badge>
							}
							id="like-tab"
							aria-controls="like-panel"
						/>
					</Tabs>
				</AppBar>

				<div role="tabpanel" hidden={currentTab !== 0}>
					<form onSubmit={changeName} noValidate className={classes.form}>
						<TextField
							id="firstName"
							label="First Name"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						/>
						<TextField
							id="lastName"
							label="Last Name"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						/>
						<Button type="submit" variant="contained" color="primary">
							Submit
						</Button>
					</form>
					{/* Category filters */}
					{categories.map((category) => (
						<FormControlLabel
							key={category}
							label={category}
							control={
								<Checkbox
									name={category}
									color="primary"
									onChange={togleCategory}
									checked={filterCategories.includes(category)}
								/>
							}
						/>
					))}
					{/* Jokes Cards */}
					{jokesToShow.map((joke, index) => {
						if (
							joke.categories.length === 0 ||
							categoryMatch(joke.categories)
						) {
							return (
								<JokeCard
									joke={joke}
									key={joke.id}
									likeJoke={likeJoke}
									unlikeJoke={unlikeJoke}
									index={index}
								/>
							);
						}
					})}
					{loading && <Spinner />}
				</div>
				<div role="tabpanel" hidden={currentTab !== 1}>
					{likedJokes.map((joke) => (
						<JokeCard
							joke={joke}
							key={joke.id}
							likeJoke={likeJoke}
							unlikeJoke={unlikeJoke}
						/>
					))}
				</div>
			</Container>
		</div>
	);
}

export default App;
