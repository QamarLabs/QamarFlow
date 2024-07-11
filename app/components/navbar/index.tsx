import React, { FC } from 'react';
import { Button, Image, Flex, Box, Spacer } from '@chakra-ui/react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useAppSelector } from '@/hooks/index';
import { GrLogout } from 'react-icons/gr';
import { signOut, useSession } from 'next-auth/react';
import LoginModal from '../login/modal';

type IProps = {
  bg?: string;
};

const NavBar: FC<IProps> = ({ bg }) => {
  const { data: session } = useSession();
  const [showLoginModal, setShowLoginModal] = React.useState<boolean>(false);
  const user = useAppSelector(state => state.user);
  const logout = async () => await signOut();
  // const logout = async () => {
  // const URL = '/api/logout';

  // const response = await fetch(URL, {
  //   method: 'POST',
  //   mode: 'cors',
  //   cache: 'no-cache',
  //   credentials: 'same-origin',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   redirect: 'follow',
  //   referrerPolicy: 'no-referrer',
  //   body: JSON.stringify({})
  // });

  // const responseInJson = await response.json();

  // if (responseInJson.message === 'success') {
  //   window.location.href = `${window.location.origin}/login`;
  // }
  // };

  const renderButtons = () => {
    if (session) {
      return (
        <Button
          fontSize="20"
          color="danger"
          variant="link"
          float="right"
          mr="2"
          pr="2"
          onClick={logout}>
          <GrLogout />
        </Button>
      );
    }

    return (
      <>
        <Button
          onClick={() => setShowLoginModal(true)}
          fontSize="20"
          color="brand"
          variant="link"
          float="right"
          mr="5"
          pr="5">
          <p>Log in</p>
        </Button>
      </>
    );
  };

  return (
    <>
      <Box bg={bg} boxShadow="md">
        <Flex>
          <Image height="12" src="/qamarflow-logo.svg" alt="brand logo" m="5"></Image>
          <Spacer />
          {renderButtons()}
        </Flex>
      </Box>
      <LoginModal showModal={showLoginModal} setShowModal={setShowLoginModal} />
    </>
  );
};

export default NavBar;
