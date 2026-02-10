import { useState } from 'react'

import Button from '../../forms/simple-components/Button'
import Modal from '../../forms/simple-components/Modal'
import MessageModal from '../../forms/widget-components/Modals/MessageModal'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const ModalShowCase = () => {
  const [simpleModalOpen, setSimpleModalOpen] = useState(false)
  const [messageModal, setMessageModal] = useState(false)

  return (
    <Wrapper direction="column" title="Modal">
      <Stack direction="column">
        <Button variant="black-solid" onPress={() => setSimpleModalOpen(true)}>
          Open simple modal
        </Button>
        <Button variant="black-solid" onPress={() => setMessageModal(true)}>
          Open message modal
        </Button>

        {/* Simple Modal Example */}
        <Modal
          isOpen={simpleModalOpen}
          onOpenChange={setSimpleModalOpen}
          modalClassname="max-w-[700px]"
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-h3 font-semibold">Simple Modal Example</h2>
            <div className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-center rounded-lg bg-[green] p-4 text-white">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an
                unknown printer took a galley of type and scrambled it to make a type specimen book.
              </div>
              <div className="mt-2 flex justify-between">
                <Button variant="black-outline" onPress={() => setSimpleModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="black-solid" onPress={() => setSimpleModalOpen(false)}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        <MessageModal
          type="success"
          isOpen={messageModal}
          onOpenChange={setMessageModal}
          title="Lorem ipsum"
          buttons={[
            <Button key="test-button" variant="black-plain">
              Test button
            </Button>,
          ]}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </MessageModal>
      </Stack>
    </Wrapper>
  )
}

export default ModalShowCase
