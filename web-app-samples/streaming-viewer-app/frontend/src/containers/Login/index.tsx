import './Login.css';

import React, { useState } from 'react';

import LoginEntranceFormFieldGroup from '@/components/LoginEntranceFormFieldGroup';

const Login: React.FC<Record<string, never>> = () => {
  const [roomId, setRoomId] = useState<string>('');
  const onSubmitSuccess = (): void => {
    window.open(`/room/${roomId}`);
  };
  return (
    <div className="start-layout">
      <LoginEntranceFormFieldGroup roomId={roomId} onChangeRoomId={setRoomId} onSubmitSuccess={onSubmitSuccess} />
    </div>
  );
};

export default Login;
