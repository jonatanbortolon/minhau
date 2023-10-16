import { ApiResponse } from '@/types/apiResponse'
import { getApiUrlFromServer } from '@/utils/getApiUrlFromServer'

export default async function Page({ params }: { params: { token: string } }) {
  try {
    const response: ApiResponse<{ latitude: number; longitude: number }> =
      await fetch(`${getApiUrlFromServer()}/user/email/token`, {
        method: 'PUT',
        body: JSON.stringify({
          token: params.token,
        }),
      }).then((res) => res.json())

    if (!response.success) {
      throw new Error(response.payload.message)
    }

    return <>Email atualizado com sucesso.</>
  } catch (error: any) {
    return <>{error.message}</>
  }
}
