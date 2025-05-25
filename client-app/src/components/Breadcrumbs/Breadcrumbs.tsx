import React from 'react';
import { Breadcrumb,Box, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

import { LiaSlashSolid } from "react-icons/lia"
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {  
  return (
    <Box py={2}> 
      <Breadcrumb.Root >
        <HStack gap={0} alignItems='center' color='gray.600' fontSize='sm'>
        {items.map((item, index) => (
          <Breadcrumb.Item key={index} current={item.isCurrentPage}>
            {index > 0 && <LiaSlashSolid />}
            {item.href && !item.isCurrentPage ? (
              <Breadcrumb.Link as={Link} to={item.href} _hover={{ color: 'brand.600' }}>
                {item.label}
              </Breadcrumb.Link>
            ) : (
                <>
              <Breadcrumb.Link
                as={Link} 
                to={item.href} 
                color={item.isCurrentPage ? 'gray.800' : 'gray.600'}
                fontWeight={item.isCurrentPage ? 'semibold' : 'normal'}
                cursor={item.isCurrentPage ? 'default' : 'pointer'}
              >
              {item.label}
              </Breadcrumb.Link></>
            )}
          </Breadcrumb.Item>          
        ))}
        </HStack>
      </Breadcrumb.Root>
    </Box>
  );
};

export default Breadcrumbs;