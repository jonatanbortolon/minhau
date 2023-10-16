import { DeleteUserFormComponent } from '@/components/deleteUserForm'
import { UpdateEmailFormComponent } from '@/components/updateEmailFormComponent'
import { UpdatePasswordComponent } from '@/components/updatePasswordForm'
import { UpdateProfileFormComponent } from '@/components/updateProfileFormComponent'
import { ApiResponse } from '@/types/apiResponse'
import { cloneHeaders } from '@/utils/cloneHeaders'
import { getApiUrlFromServer } from '@/utils/getApiUrlFromServer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minhau - Meu perfil',
}

export const dynamic = 'force-dynamic'

export default async function Page() {
  const response: ApiResponse<{ latitude: number; longitude: number }> =
    await fetch(`${getApiUrlFromServer()}/user/location`, {
      headers: cloneHeaders(),
    }).then((res) => res.json())

  if (!response.success) {
    throw new Error('Failed to load profile location')
  }

  const location = response.payload

  return (
    <div className="w-full flex flex-col p-6">
      <div className="w-full flex items-center justify-start mb-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Meu perfil
        </h1>
      </div>
      <div className="w-full flex flex-col gap-10">
        <UpdateProfileFormComponent initialLocation={location} />
        <UpdateEmailFormComponent />
        <UpdatePasswordComponent />
        <DeleteUserFormComponent />
      </div>
    </div>
  )
}
