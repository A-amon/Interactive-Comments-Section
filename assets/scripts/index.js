import Comment from "./Comment.js"
import {createElement, isTextEmpty} from "./helper.js"

class Main {
	comments = [];
	currentUser;

	build(){
		this.setupComments()
		this.setupNotif()
		this.setupForm()
	}

	async init(){
		const data = await this.getData()

		this.currentUser = data.currentUser
		const commentsData = data.comments

		for(const commentData of commentsData){
			commentData.replies = commentData.replies
								?commentData.replies
								.map(reply => {
									const {id, content, createdAt, score, user, replyingTo} = reply
									const replyObj = new Comment(id, content, createdAt, score, user)
									replyObj.replyingTo = replyingTo
									return replyObj
								})
								:[]

			const {id, content, createdAt, score, user, replies} = commentData
			const comment = new Comment(id, content, createdAt, score, user, replies)

			this.comments.push(comment)
		}
	}

	/**
	 * Get comments and replies data
	 * - From localStorage if available
	 * - Else, from data.json then store in localStorage
	 * @returns {object}
	 */
	async getData(){
		const response = await fetch('../assets/data.json')
		const responseData = await response.json()

		let commentsData = JSON.parse(localStorage.getItem('comments'))
		if(!commentsData){
			localStorage.setItem('comments',JSON.stringify(responseData.comments))
			commentsData = responseData.comments
		}
		return {
			currentUser:{...responseData.currentUser},
			comments:[...commentsData]
		}
	}

	/**
	 * Displaying comments and replies
	 */
	setupComments(){
		const commentsWrapper = document.querySelector('.comments')

		commentsWrapper.innerHTML = ''
		this.comments.forEach(comment => {
			const hasReplies = comment.hasReplies

			hasReplies && (commentsWrapper.appendChild(document.createElement('article')))

			const commentEl = createElement(comment.getBuild(this.currentUser))
			comment.addEventListeners(commentEl)
			commentsWrapper.appendChild(commentEl)

			if(hasReplies){
				const repliesEl = createElement(`<div class="comment__replies"></div>`)

				comment.replies
				.forEach(reply => {
					const replyEl = createElement(reply.getBuild(this.currentUser))
					reply.addEventListeners(replyEl)
					repliesEl.appendChild(replyEl)
				})
				
				commentsWrapper.appendChild(repliesEl)
			}
		})
	}

	/**
	 * Add notif event listeners
	 */
	setupNotif(){
		const notif = document.querySelector('.notif')
		const notifText = notif.querySelector('.notif__text')
		const notifBtn = notif.querySelector('.notif__btn')

		const hideNotif = () => {
			notif.classList.remove('active')
		}

		document.addEventListener('update', (event) => {
			notif.classList.add('active')
			notifText.textContent = event.detail
			this.update()
		})

		let notifTimeout

		//Hide notification after 3s
		notif.addEventListener('animationend', () => {
			notifTimeout = setTimeout(() => hideNotif(), 3000)
		})

		notifBtn.addEventListener('click', () => {
			hideNotif()
			clearTimeout(notifTimeout)
		})
	}

	/**
	 * Add form event listeners
	 */
	setupForm(){
		const cForm = document.querySelector('.form')
		const cFormInput = cForm.querySelector('.form-textarea')
		const cFormBtn = cForm.querySelector('.form__btn')

		cFormInput.addEventListener('input', () => {
			const commentToAdd = cFormInput.textContent
			/**
			 * Disable/ Enable SEND comment button if input empty/ not empty
			 */
			if(!isTextEmpty(commentToAdd)){
				cFormInput.classList.add('form-textarea--filled')
				cFormBtn.removeAttribute('disabled')
				cFormBtn.ariaDisabled = false
			}
			else{
				cFormInput.classList.remove('form-textarea--filled')
				cFormBtn.setAttribute('disabled', true)
				cFormBtn.ariaDisabled = true
			}
		})

		cForm.addEventListener('submit', (event) => {
			event.preventDefault()
			const commentText = cFormInput.textContent
			const commentCreatedAt = "1 second ago"
			const newComment = new Comment(this.getNewCommentId(), commentText, commentCreatedAt, 0, this.currentUser)
			
			this.comments.push(newComment)
			this.update()
		})
	}

	update(){
		localStorage.setItem('comments',JSON.stringify(this.getCommentObjects()))
		this.setupComments()
	}

	/**
	 * Get list of comment objects
	 * @returns {array}
	 */
	getCommentObjects(){
		const commentObjects = []
		this.comments.forEach(comment => {
			const commentObj = {
				id:comment.id,
				content:comment.content,
				createdAt:comment.createdAt,
				score:comment.score,
				user:comment.user
			}
			if(comment.hasReplies){
				commentObj.replies = comment.replies.map(reply => ({
					id:reply.id,
					content:reply.content,
					createdAt:reply.createdAt,
					score:reply.score,
					user:reply.user
				}))
			}
			commentObjects.push(commentObj)
		})
		return commentObjects
	}

	/**
	 * Get new comment id
	 * Number after latest comment/reply id
	 * @returns {number}
	 */
	getNewCommentId(){
		const lastComment = this.comments[this.comments.length - 1]
		if(lastComment.hasReplies){
			const replies = lastComment.replies
			const lastReply = replies[replies.length - 1]
			return lastReply.id
		}
		return lastComment.id
	}
}

const main = new Main()
main.init()
.then(() => main.build())