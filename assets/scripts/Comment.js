import Counter from "./Counter.js"
import { getImageName, createElement } from "./helper.js"

class Comment {
	#id;
	#content;
	#createdAt;
	#user;
	#replies;
	#hasReplies;
	#replyingTo;
	#counter;

	constructor(id, content, createdAt, score, user, replies){
		this.#id = id
		this.#content = content
		this.#createdAt = createdAt
		this.#user = user
		this.#counter = new Counter(score)

		this.#replies
		if(replies){
			this.#replies = replies
			this.#hasReplies = replies.length > 0
		}
	}

	get id(){
		return this.#id
	}

	get content(){
		return this.#content
	}

	get createdAt(){
		return this.#createdAt
	}

	get score(){
		return this.#counter.count
	}

	get user(){
		return this.#user
	}

	get hasReplies() {
		return this.#hasReplies
	}

	get replies(){
		return this.#replies
	}

	get replyingTo(){
		return this.#replyingTo
	}

	set replyingTo(replyingTo){
		this.#replyingTo = replyingTo
	}
	
	getBuild(currentUser){
		const isCurrentUser = (currentUser.username === this.#user.username)

		const build = `<article class="comment card">
							${this.#counter.getBuild()}
							<div class="card__header comment__header">
								<img class="profile comment__profile" src="./assets/images/${getImageName(this.#user.image.png)}" alt="">
								<h3 class="comment__user">
									${this.#user.username}
									${
										isCurrentUser
										?`
										<strong class="comment__user-you">
											you
										</strong>
										`
										:''
									}
								</h3>
								<p class="comment__date">
									<span class="sr-only">
										Commented on 
									</span>
									${this.#createdAt}
								</p>
								<div class="comment__btn-wrapper comment__btn-wrapper--medium">
								${
									!isCurrentUser 
									?`
										<button class="btn btn--reply">
											Reply
										</button>
									`
									:`
										<button class="btn btn--delete">
											Delete
										</button>
										<button class="btn btn--edit">
											Edit
										</button>
									`
								}
								</div>
								
							</div>
							<p class="comment__text">
								${this.#replyingTo? `<a href="#" class="comment__tag" contenteditable="false">@${this.#replyingTo}</a>`:''} ${this.#content}
							</p>
							<div class="comment__footer card__footer card__footer">
								${this.#counter.getBuild()}
								<div class="comment__btn-wrapper">
								${
									isCurrentUser
									? `
										<button class="btn btn--delete">
											Delete
										</button>
										<button class="btn btn--edit">
											Edit
										</button>
										<button class="btn btn--blue">
											Update
										</button>
									`:
									`
										<button class="btn btn--reply">
											Reply
										</button>
									`
								}
								</div>
							</div>
						</article>`

			return build
	}

	addEventListeners(element){
		const counterEls = element.querySelectorAll('.counter')
		this.#counter.addEventListeners(counterEls)

		let commentTextEl = element.querySelector('.comment__text')
		const updateBtn = element.querySelector('.btn--blue')
		const editBtns = element.querySelectorAll('.btn--edit')

		/**
		 * Allow comment to be editable
		 * - Replace <p> with <div>
		 */
		const toggleEditableText = () => {
			updateBtn.classList.toggle('active')

			let newTextEl
			if(updateBtn.classList.contains('active')){
				newTextEl = createElement('<div class="comment__text"></div>')
				newTextEl.innerHTML = commentTextEl.innerHTML 
				newTextEl.setAttribute('contenteditable', true)
			}
			else{
				newTextEl = createElement('<p class="comment__text"></p>')
				newTextEl.innerHTML = commentTextEl.innerHTML 
			}

			element.replaceChild(newTextEl, commentTextEl)
			commentTextEl = newTextEl
		}

		/**
		 * EDIT BUTTON
		 */
		editBtns.forEach(editBtn => {
			editBtn.addEventListener('click', () => toggleEditableText())
		})

		/**
		 * UPDATE BUTTON
		 */
		updateBtn && updateBtn.addEventListener('click', () => {
			const commentTagEl = commentTextEl.children[0]
			const newCommentText = commentTextEl.textContent.replace(`${commentTagEl.textContent} `,'')
			this.#content = newCommentText

			const updateEvent = new CustomEvent('update',{detail:'You updated a comment!'})
			document.dispatchEvent(updateEvent)
			
			toggleEditableText()
		})
	}
}

export default Comment