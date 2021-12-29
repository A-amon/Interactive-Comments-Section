import Comment from "./Comment.js"
import {createElement, isTextEmpty} from "./helper.js"

class Main {
	comments = [];
	currentUser;

	build(){
		/**
		 * DISPLAYING COMMENTS
		 */
		const commentsWrapper = document.querySelector('.comments')

		this.comments.forEach(comment => {
			const hasReplies = comment.getHasReplies()

			hasReplies && (commentsWrapper.appendChild(document.createElement('article')))

			const commentEl = createElement(comment.getBuild(this.currentUser))
			comment.addEventListeners(commentEl)
			commentsWrapper.appendChild(commentEl)

			if(hasReplies){
				const repliesEl = createElement(`<div class="comment__replies"></div>`)

				comment.getReplies()
				.forEach(reply => {
					const replyEl = createElement(reply.getBuild(this.currentUser))
					reply.addEventListeners(replyEl)
					repliesEl.appendChild(replyEl)
				})
				
				commentsWrapper.appendChild(repliesEl)
			}
		})

		/**
		 * NOTIFICATION
		 */
		const notif = document.querySelector('.notif')
		const notifText = notif.querySelector('.notif__text')
		const notifBtn = notif.querySelector('.notif__btn')

		const hideNotif = () => {
			notif.classList.remove('active')
		}

		document.addEventListener('update', (event) => {
			notif.classList.add('active')
			notifText.textContent = event.detail
		})

		let notifTimeout

		notif.addEventListener('animationend', () => {
			notifTimeout = setTimeout(() => hideNotif(), 3000)
		})
		notifBtn.addEventListener('click', () => {
			hideNotif()
			clearTimeout(notifTimeout)
		})

		/**
		 * ADD COMMENT FORM
		 */
		const cForm = document.querySelector('.form')
		const cFormInput = cForm.querySelector('.form-textarea')
		const cFormBtn = cForm.querySelector('.form__btn')

		cFormInput.addEventListener('input', () => {
			const commentToAdd = cFormInput.textContent
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
			const commentToAdd = cFormInput.textContent
			// Submit
		})
	}

	async init(){
		this.currentUser = "juliusomo"

		const response = await fetch('../assets/data.json')
		const data = await response.json()

		const commentsData = data.comments

		for(const commentData of commentsData){
			commentData.replies = commentData.replies
							.map(reply => {
								const {id, content, createdAt, score, user, replyingTo} = reply
								const replyObj = new Comment(id, content, createdAt, score, user)
								replyObj.setReplyingTo(replyingTo)
								return replyObj
							})

			const {id, content, createdAt, score, user, replies} = commentData
			const comment = new Comment(id, content, createdAt, score, user, replies)

			this.comments.push(comment)
		}
	}
}

const main = new Main()
main.init()
.then(() => main.build())