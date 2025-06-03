import * as React from "react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogBackdrop,
} from "./dialog";
import { Button, type DialogRootProps } from "@chakra-ui/react";

export interface AlertDialogProps extends Omit<DialogRootProps, "children"> {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  colorScheme?:
    | "red"
    | "blue"
    | "green"
    | "yellow"
    | "purple"
    | "teal"
    | "cyan"
    | "pink"
    | "gray";
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const AlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(
  function AlertDialog(
    {
      title = "Confirm Action",
      description = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      colorScheme = "red",
      onConfirm,
      onCancel,
      isLoading = false,
      children,
      ...props
    },
    ref
  ) {
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    return (
      <DialogRoot
        role="alertdialog"
        initialFocusEl={() => cancelRef.current}
        {...props}
      >
        <DialogBackdrop />
        <DialogContent ref={ref}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>{children || description}</DialogBody>
          <DialogFooter>
            <Button
              ref={cancelRef}
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              colorScheme={colorScheme}
              onClick={onConfirm}
              loading={isLoading}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    );
  }
);
