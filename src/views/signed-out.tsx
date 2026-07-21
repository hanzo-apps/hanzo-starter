import { useIam } from '@hanzo/iam/react'
import { YStack, H1, Paragraph, Button } from '@hanzo/gui'

/**
 * Signed-out landing. One action: PKCE sign-in with Hanzo (hanzo.id). There is
 * no local credential form — Hanzo IAM owns every credential interaction.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" gap="$5" padding="$6" backgroundColor="$background">
      <YStack alignItems="center" gap="$3" maxWidth={440}>
        <H1 textAlign="center">Hanzo Starter</H1>
        <Paragraph textAlign="center" opacity={0.6}>
          A real app on Hanzo — @hanzo/gui for UI, Hanzo IAM for auth, Hanzo Base
          for data. Sign in to try the notes below (stored per-org in Base).
        </Paragraph>
      </YStack>
      <Button size="$5" theme="active" disabled={isLoading} onPress={() => login()}>
        {isLoading ? 'Loading…' : 'Sign in with Hanzo'}
      </Button>
    </YStack>
  )
}
