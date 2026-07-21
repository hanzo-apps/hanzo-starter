import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Paragraph, Button } from '@hanzo/gui'
import { Notes } from './notes'

/** Signed-in shell: who you are + a Base-backed surface, with sign-out. */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background">
      <XStack alignItems="center" justifyContent="space-between" padding="$4" borderBottomWidth={1} borderColor="$borderColor">
        <H1 fontSize="$7">Hanzo Starter</H1>
        <Button size="$3" onPress={() => logout()}>Sign out</Button>
      </XStack>
      <YStack padding="$4" gap="$4" maxWidth={640} width="100%" alignSelf="center">
        <Paragraph opacity={0.6}>Signed in as {who}</Paragraph>
        <Notes />
      </YStack>
    </YStack>
  )
}
