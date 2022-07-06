const express = require('express');
const router = express.Router();
const db = require('../data/database')

router.get('/', function (red, res) {
	res.redirect('/posts');
})
router.get('/posts', async function (red, res) {
	const query = `select posts.*, authors.name as authors_name from posts inner join  authors 
	on  posts.author_id = authors.id `;
	const [posts] = await db.query(query);
	res.render('posts-list', { posts: posts });
})
router.get('/new-post', async function (red, res) {
	const [authors] = await db.query('SELECT * FROM authors');
	res.render('create-post', { authors: authors });
})
router.post('/posts', async function (req, res) {
	const data = [
		req.body.title,
		req.body.summary,
		req.body.content,
		req.body.author,
	];
	await db.query('INSERT INTO posts (title, summary, body, author_id) VALUES (?)', [
		data,
	]);
	res.redirect('/posts')
})
router.get('/posts/:id', async function (req, res) {
	const query = `select posts.*,authors.name as authors_name,authors.email as authors_email
	from posts inner join  authors 
	on  posts.author_id = authors.id where posts.id=?`;
	const [posts] = await db.query(query, [req.params.id,]);
	
	if (!posts || posts.length === 0) {
		return res.status(404).render('404')
	}
	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
	const postData ={
		...posts[0],
		data:posts[0].date=new Date(),
 		humanReadableDate:posts[0].date.toLocaleDateString('en-US', options)
	};
	res.render('post-detail', { post: postData})
})
router.get('/posts/:id/edit',async function(req,res){
	const query = `select * from posts where id =?`;
	const [posts] = await db.query(query,[req.params.id]);
	if (!posts || posts.length === 0) {
		return res.status(404).render('404')
	}
	res.render('update-post',{post:posts[0]})
})
router.post('/posts/:id/edit',async function(req,res){
	const query = `update posts set title =?,summary=?,body=? where id =?`;
	const [posts] = await db.query(query,[
		req.body.title,
		req.body.summary,
		req.body.content,
		req.params.id
	]);
	
	res.redirect('/posts');
})
router.post('/posts/:id/delete', async function(req,res){
	await db.query( `delete from posts where id =?`,[req.params.id]);
	res.redirect('/posts');
	
})
module.exports = router;