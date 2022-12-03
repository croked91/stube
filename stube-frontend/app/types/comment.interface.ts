import { IBase } from './base.interface'
import { ISubscription, IUser } from './user.interface'
import { IVideo } from './video.interface'

export interface IComment extends IBase {
	user: IUser
	message: string
	video: IVideo
}

export interface ICommentDto extends Pick<IComment, 'message'> {
	videoId: number
}