import { LinkProps as ReactRouterLinkProps } from 'react-router-dom';

declare module '@chakra-ui/react' {
  // Расширяем ButtonProps для поддержки React Router Link с полной типобезопасностью
  interface ButtonProps extends Partial<ReactRouterLinkProps> {
    as?: React.ElementType;
  }
  
  // Расширяем BreadcrumbLinkProps для поддержки React Router Link с полной типобезопасностью
  interface BreadcrumbLinkProps extends Partial<ReactRouterLinkProps> {
    as?: React.ElementType;
  }
  
  // Поддержка current состояния для BreadcrumbItem
  interface BreadcrumbItemProps {
    current?: boolean;
  }
  
  // Расширяем FlexProps для HTML атрибутов форм с типобезопасностью
  interface FlexProps {
    as?: React.ElementType;
    href?: string;
    action?: string;
    method?: 'get' | 'post' | 'put' | 'delete';
  }
  
  // Добавляем поддержку leftIcon для Button (для совместимости)
  interface ButtonProps {
    leftIcon?: React.ReactElement;
  }
}
