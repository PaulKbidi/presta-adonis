// import type { HttpContext } from '@adonisjs/core/http'

import User from "#models/user";
import { cuid } from "@adonisjs/core/helpers";
import { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";
import fs from 'fs/promises'

export default class UsersController {
  async profile({ auth, response}: HttpContext) {
    const user = await auth.authenticate()
    const { password, enabled, isAdmin, ...userInfo} = user.$attributes
    return response.ok(userInfo)
  }

  async usersWithoutAdminAndIsEnable({response}: HttpContext) {
    try {
      const users = await User.findManyBy({enabled: "1", isadmin: "0"})
      if(!users){
        return response.badRequest({message: 'user not found'})
      }
      const usersInfo: User[] = []
      users.map(user => {
        const { password, isAdmin, ...userInfo} = user.$attributes
        usersInfo.push(userInfo as User)
      })
      return response.ok(usersInfo)
    } catch (error) {
      console.log(error)
      return response.badRequest({message: 'error'})
    }
  }

  async usersWithoutAdmin({response}: HttpContext) {
    try {
      const users = await User.findManyBy('isadmin', '0')
      if(!users){
        return response.badRequest({message: 'user not found'})
      }
      const usersInfo: User[] = []
      users.map(user => {
        const { password, isAdmin, ...userInfo} = user.$attributes
        usersInfo.push(userInfo as User)
      })
      return response.ok(usersInfo)
    } catch (error) {
      console.log(error)
      return response.badRequest({message: 'error'})
    }
  }

  async updateProfile({request, auth, response}: HttpContext) {
    try{
      const user = await auth.authenticate()
      if(!user){
        return response.badRequest({message: 'user not found'})
      }
      const { fullname, email, area, tel, job } = request.all()
      user.fullname = fullname
      user.email = email
      user.area = area
      user.tel = tel
      user.job = job
      await user.save()
      return response.ok({message: 'profile updated'})
    } catch (error) {
      console.log(error)
      return response.badRequest({message: 'error'})
    }
  }

  async updateProfileImg({request, auth, response}: HttpContext) {
    try{
      const user = await auth.authenticate()
      if(!user){
        return response.badRequest({message: 'user not found'})
      }

      const filename = user.img

      await fs.access('public/uploads/'+filename)
      await fs.unlink('public/uploads/'+filename)

      const image = request.file('img', {
        extnames: ['png', 'jpg', 'jpeg', 'gif'],
        size: '10mb'
      })

      if(!image || !image.isValid){
        return response.badRequest({message: 'image invalide'})
      }

      if(!image){
        return response.badRequest({message: 'image not found'})
      }

      const newfilename = `${cuid()}.${image.extname}`

      user.img = newfilename
      await user.save()
      await image.move('public/uploads', {name: newfilename})
      return response.ok({message: 'profile img updated'})
    } catch (error) {
      console.log(error)
      return response.badRequest({message: 'error'})
    }
  }

  async updatePassword({request, auth, response}: HttpContext) {
    try{
      const user = await auth.authenticate()
      if(!user){
        return response.badRequest({message: 'user not found'})
      }

      const { newpassword, oldpassword } = request.all()

      if (!newpassword || !oldpassword) {
        return response.badRequest({message: 'champs manquants'})
      }

      const isOldPasswordValid = await hash.verify(user.password, oldpassword)
      if(!isOldPasswordValid) {
        return response.badRequest({message: 'old password not valid'})
      }

      user.password = newpassword
      await user.save()
      return response.ok({message: 'password updated'})
    } catch (error) {
      console.log(error)
      return response.badRequest({message: 'error'})
    }
  }
}
