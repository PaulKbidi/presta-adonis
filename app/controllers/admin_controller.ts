// import type { HttpContext } from '@adonisjs/core/http'

import Job from "#models/job"
import User from "#models/user"
import fs from 'fs/promises'
import { HttpContext } from "@adonisjs/core/http"
import { cuid } from "@adonisjs/core/helpers"

export default class AdminController {
  async usersInfo ({response}: HttpContext) {
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

  async userInfoById ({request, response}: HttpContext) {
    try {
      const idUser = request.params().id
      const user = await User.find(idUser)
      if(!user){
        return response.badRequest({message: 'user not found'})
      }
      const { password, isAdmin, ...userInfo} = user.$attributes
      return response.ok(userInfo)
    } catch (error) {
      console.log(error)
      return response.badRequest({message: 'error'})
    }
  }

  async updateUserWithId ({request, response}: HttpContext) {
    try {
      const idUser = request.params().id
      const { fullname, email, area, tel, job} = request.all()
      const user = await User.find(idUser)
      if (!user) {
        return response.badRequest({ message: 'User not found' })
      }

      const jobExist = await Job.findBy('id', job)
      if (!jobExist) {
        return response.badRequest({ message: 'Job not found' })
      }

      if (fullname || email || area || tel || job) {
        user.fullname = fullname
        user.email = email
        user.area = area
        user.tel = tel
        user.job = job
        await user.save()
        return response.ok({message: 'user updated'})
      }
    } catch (error) {
      console.log(error)
      return response.badRequest({message: 'error'})
    }
  }

  async deleteUserWithId ({request, response}: HttpContext) {
    try {
      const idUser = request.params().id
      const user = await User.find(idUser)
      if (!user) {
        return response.badRequest({ message: 'User not found' })
      }
      await user.delete()
      return response.ok({message: 'user deleted'})
    } catch (error) {
      console.log(error)
      return response.badRequest({message: 'error'})
    }
  }

  async enableUserWithId ({request, response}: HttpContext) {
    try {
      const idUser = request.params().id
      const user = await User.find(idUser)
      if (!user) {
        return response.badRequest({ message: 'User not found' })
      }

      user.enabled = !user.enabled
      await user.save()
      return response.ok({message: 'user enabled'})
    } catch (error) {
      console.log(error)
      return response.badRequest({message: 'error'})
    }
  }

  async updatePasswordWithId ({request, response}: HttpContext) {
    try {
      const idUser = request.params().id
      const { password } = request.all()
      const user = await User.find(idUser)
      if (!user) {
        return response.badRequest({ message: 'User not found' })
      }
      user.password = password
      await user.save()
      return response.ok({message: 'password updated'})
    } catch (error) {
      console.log(error)
      return response.badRequest({message: 'error'})
    }
  }

  async updateImageWithId ({request, response}: HttpContext) {
    try {
      const idUser = request.params().id
      const user = await User.find(idUser)
      if (!user) {
        return response.badRequest({ message: 'User not found' })
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
}
