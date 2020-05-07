import React, { useEffect, useState } from "react";
import {
	AppBar,
	CssBaseline,
	Container,
	CircularProgress,
	Typography,
	Tab,
	Tabs,
} from "@material-ui/core";
import "./App.css";

import JokeCard from "./JokeCard";

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

	const [jokes, setJokes] = useState([]);
	const [categories, setCategories] = useState([]);
	const [jokesToShow, setJokesToShow] = useState([]);
	const [likedJokes, setLikedJokes] = useState([]);
	const [currentTab, setCurrentTab] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const bottomJokeEl = document.getElementById(
			`joke-${jokesToShow.length - 1}`
		);
		observeElement(bottomJokeEl);
	}, [jokesToShow]);

	const getJokes = () => {
		fetch("https://api.icndb.com/jokes")
			.then((res) => res.json())
			.then((res) => {
				setJokes(res.value);
				setJokesToShow(res.value.slice(0, 10));
			})
			.catch((err) => console.log(err));
	};

	const getCategories = () => {
		fetch("https://api.icndb.com/categories")
			.then((res) => res.json())
			.then((res) => {
				setCategories(res.value);
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
						<Tab label="Likes" id="like-tab" aria-controls="like-panel" />
					</Tabs>
				</AppBar>

				<div role="tabpanel" hidden={currentTab !== 0}>
					{/* Category filters */}
					{/* Jokes Cards */}
					{jokesToShow.map((joke, index) => {
						return (
							<JokeCard
								joke={joke}
								key={joke.id}
								likeJoke={likeJoke}
								unlikeJoke={unlikeJoke}
								index={index}
							/>
						);
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
