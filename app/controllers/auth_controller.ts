import Job from '#models/job'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'


export default class AuthController {
 async register({ request, response }: HttpContext) {
   try {
     const email = request.input('email')
     const password = request.input('password')
     const fullname = request.input('fullname')
     const area = request.input('area')
     const tel = request.input('tel')
     const job = request.input('job')


     // Check if every fields are filled
     if (!email || !password || !fullname || !area || !tel || !job) {
       return response.badRequest({ message: 'All fields are required' })
     }


     // Check if the email is already registered
     const userExist = await User.findBy('email', email)
     if (userExist) {
       return response.badRequest({ message: 'Email already registered' })
     }


     // check if job exist
     const jobExist = await Job.findBy('id', job)
     if (!jobExist) {
       return response.badRequest({ message: 'Job not found' })
     }

     const image = request.file('img', {
      extnames: ['png', 'jpg', 'jpeg', 'gif'],
      size: '10mb',
     })

     if (!image || !image.isValid) {
      return response.badRequest({message: 'image invalide'})
     }

     const filename = `${cuid()}.${image.extname}`


     // Create the user
     const user = await User.create({
       email: email,
       password: password,
       fullname: fullname,
       area: area,
       tel: tel,
       img: filename,
       job: job,
     })


     await user.save()
     await image.move('public/uploads', {name: filename})


     return response.created({ message: 'User created' })
   } catch (error) {
     console.log(error)
     return response.internalServerError({ message: 'An error occured during registration' })
   }
 }

 async login({ request, response}: HttpContext) {
  try {
    const {email, password} = request.all()
    if (!email || !password){
      return response.badRequest({message: 'les deux champs sont requies'})
    }

    const user = await User.findBy('email',email)
    if (!user) {
      return response.badRequest({message: 'utilisateur introuvable'})
    }

    const passordValid = await hash.verify(user.password, password)
    if (!passordValid) {
      return response.badRequest({message: 'mot de passe invalide'})
    }

    const isEnable = await user.enabled
    if (isEnable == false) {
      return response.badRequest({message: 'votre compte n\'est pas vérifier'})
    }

    const token = await User.accessTokens.create(user)
    return response.ok({message: 'connecter', token: token})
  } catch (error){
    console.log(error)
    return response.internalServerError({message: 'une erreur s\'est produite pendant la connexion' })
  }
 }

 async logout({ auth, response}: HttpContext) {
  try  {
    User.accessTokens.delete(
      auth.user as User,
      auth.user?.currentAccessToken?.identifier as string
    )
    return response.ok({
      message:
      'déconnecter'
    })
  }catch (error) {
    console.log(error)
    return response.internalServerError({
      message:
      'une erreur s\'est produite pendant la déconnexion'
    })
  }
 }

}
