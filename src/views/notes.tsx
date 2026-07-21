import { useState } from 'react'
import { useQuery, useMutation, type BaseRecord } from '@hanzo/base/react'
import { YStack, XStack, Input, Button, Text, Paragraph, Spinner, Separator } from '@hanzo/gui'

/** One row of the `notes` collection provisioned from schema.sql. */
interface Note extends BaseRecord {
  body: string
}

/**
 * The Base-backed data surface: list + create + delete against the `notes`
 * collection, carrying the signed-in user's IAM token (wired in providers.tsx).
 * Realtime is off — a static SPA refetches after each write, one simple path.
 */
export function Notes() {
  const { data, isLoading, error, refetch } = useQuery<Note>('notes', {
    sort: '-created',
    realtime: false,
  })
  const create = useMutation('notes', 'create')
  const remove = useMutation('notes', 'delete')
  const [body, setBody] = useState('')

  async function add() {
    const text = body.trim()
    if (!text || create.isLoading) return
    await create.mutate({ body: text })
    setBody('')
    await refetch()
  }

  async function del(id: string) {
    await remove.mutate({ id })
    await refetch()
  }

  return (
    <YStack gap="$3">
      <XStack gap="$2">
        <Input
          flex={1}
          value={body}
          placeholder="Write a note…"
          onChangeText={setBody}
          onSubmitEditing={add}
        />
        <Button theme="active" disabled={create.isLoading || !body.trim()} onPress={add}>
          Add
        </Button>
      </XStack>

      {create.error ? <Paragraph color="$red10">{create.error.message}</Paragraph> : null}

      <Separator />

      {isLoading ? (
        <XStack gap="$2" alignItems="center" opacity={0.6}>
          <Spinner /> <Text>Loading…</Text>
        </XStack>
      ) : error ? (
        <Paragraph color="$red10">
          Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that
          you’re signed in.
        </Paragraph>
      ) : data.length === 0 ? (
        <Paragraph opacity={0.6}>No notes yet — add one above.</Paragraph>
      ) : (
        <YStack gap="$2">
          {data.map((note) => (
            <XStack key={note.id} alignItems="center" justifyContent="space-between" gap="$3"
              padding="$3" borderWidth={1} borderColor="$borderColor" borderRadius="$4">
              <Text flex={1}>{note.body}</Text>
              <Button size="$2" chromeless disabled={remove.isLoading} onPress={() => del(note.id)}>
                Delete
              </Button>
            </XStack>
          ))}
        </YStack>
      )}
    </YStack>
  )
}
