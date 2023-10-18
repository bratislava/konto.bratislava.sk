import { CrossIcon } from '@assets/ui-icons'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import { useTranslation } from 'next-i18next'
import { Button as AriaButton, Dialog, Modal, ModalOverlay } from 'react-aria-components'

import BottomSheetMenuRow from './BottomSheetMenuRow'

type BottomSheetMenuModalProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  conceptMenuContent: MenuItemBase[]
}

const BottomSheetMenuModal = ({
  isOpen,
  setIsOpen,
  conceptMenuContent,
}: BottomSheetMenuModalProps) => {
  const { t } = useTranslation('account')

  const onLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* 2X ModalOverlay is here to have static background otherwise grayed-out background will animate too */}
      <ModalOverlay
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        className="fixed left-0 top-0 z-50 h-[var(--visual-viewport-height)] w-screen bg-gray-800/40 outline-0"
        isDismissable
      />
      <ModalOverlay
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        className="fixed left-0 top-0 z-50 h-[var(--visual-viewport-height)] w-screen outline-0 data-[entering]:animate-stepperSlide data-[exiting]:animate-stepperSlideReverse"
        isDismissable
      >
        <Modal
          isDismissable
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          className="fixed bottom-0 w-full outline-0"
        >
          <Dialog className="flex h-full flex-col outline-0">
            {({ close }) => (
              <>
                <div className="flex h-14 w-full flex-row items-center gap-1 rounded-t-lg border-b-2 bg-white p-4">
                  <h6 className="text-h6 grow">
                    {t('account_section_applications.mobile_modal_menu.title')}
                  </h6>
                  <AriaButton
                    className="flex h-full cursor-pointer flex-col justify-center"
                    onPress={close}
                  >
                    <CrossIcon className="h-6 w-6" />
                  </AriaButton>
                </div>
                <nav className="w-full overflow-auto bg-white p-4">
                  <ul>
                    {conceptMenuContent.map((item) => (
                      <li key={item.id} className="border-b-2 last:border-b-0">
                        <BottomSheetMenuRow
                          title={item.title}
                          icon={item.icon}
                          url={item.url}
                          onPress={item.onPress}
                          onLinkClick={onLinkClick}
                          itemClassName={item.itemClassName}
                        />
                      </li>
                    ))}
                  </ul>
                </nav>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  )
}

export default BottomSheetMenuModal
