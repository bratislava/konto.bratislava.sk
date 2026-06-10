/* eslint-disable i18next/no-literal-string */

import { Button, Typography } from '@bratislava/component-library'
import { useState } from 'react'
import { Heading } from 'react-aria-components/Heading'

import Dialog from '@/src/components/simple-components/Dialog'
import Modal from '@/src/components/simple-components/Modal'
import { Stack } from '@/src/components/styleguide/Stack'
import { Wrapper } from '@/src/components/styleguide/Wrapper'
import MessageModal from '@/src/components/widget-components/Modals/MessageModal'

const BaseModalsShowcase = () => {
  const [simpleModal, setSimpleModalOpen] = useState(false)
  const [messageModal, setMessageModal] = useState(false)

  return (
    <Wrapper title="Base" direction="column" noBorder>
      <Typography>
        <strong>Where is this used:</strong> Base Modal is the building block for custom modal
        content across the app. MessageModal is used for specific usecases outlined below.
      </Typography>
      <Stack direction="column">
        <Button variant="solid" onPress={() => setSimpleModalOpen(true)}>
          Open simple modal
        </Button>
        <Button variant="solid" onPress={() => setMessageModal(true)}>
          Open message modal
        </Button>
      </Stack>

      <Modal isOpen={simpleModal} onOpenChange={setSimpleModalOpen} modalClassname="max-w-[700px]">
        <Dialog>
          <div className="flex flex-col gap-4">
            <Heading slot="title" className="text-size-h3-r font-semibold lg:text-size-h3">
              Simple Modal Example
            </Heading>
            <div className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-center rounded-lg bg-background-passive-primary p-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an
                unknown printer took a galley of type and scrambled it to make a type specimen book.
              </div>
              <div className="mt-2 flex justify-between">
                <Button variant="outline" onPress={() => setSimpleModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="solid" onPress={() => setSimpleModalOpen(false)}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      </Modal>

      <MessageModal
        type="success"
        isOpen={messageModal}
        onOpenChange={setMessageModal}
        title="Lorem ipsum"
        primaryButton={
          <Button key="test-button" variant="solid">
            Test button
          </Button>
        }
        secondaryButton={
          <Button key="test-button" variant="outline">
            Test button
          </Button>
        }
      >
        This is a message modal. Buttons are optional, and anything can be added as children.
      </MessageModal>
    </Wrapper>
  )
}

export default BaseModalsShowcase
