import './Entrance.css';

import qs from 'query-string';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import LoginEntranceFormFieldGroup from '@/components/LoginEntranceFormFieldGroup';

const Entrance: React.FC<Record<string, never>> = () => {
  const params: { roomId: string } = useParams();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { default_layout, username, bitrate_reservation_mbps, room_type, max_connections, ice_servers_protocol } = qs.parse(window.location.search);
  const [roomId, setRoomId] = useState<string>('');
  const onSubmitSuccess = (): void => {
    const encodedUsername = typeof username === 'string' ? encodeURIComponent(username) : undefined;
    let uriPath = `/room/${roomId}`;
    let isExistQuery = false;
    if (encodedUsername) {
      uriPath += isExistQuery ? '&' : '?';
      uriPath += `username=${encodedUsername}`;
      isExistQuery = true;
    }
    if (default_layout) {
      uriPath += isExistQuery ? '&' : '?';
      uriPath += `default_layout=${default_layout}`;
      isExistQuery = true;
    }
    if (bitrate_reservation_mbps && !isNaN(Number(bitrate_reservation_mbps))) {
      uriPath += isExistQuery ? '&' : '?';
      uriPath += `bitrate_reservation_mbps=${bitrate_reservation_mbps}`;
      isExistQuery = true;
    }
    if (room_type) {
      uriPath += isExistQuery ? '&' : '?';
      uriPath += `room_type=${room_type}`;
      isExistQuery = true;
    }
    if (max_connections) {
      uriPath += isExistQuery ? '&' : '?';
      uriPath += `max_connections=${max_connections}`;
      isExistQuery = true;
    }
    if (ice_servers_protocol) {
      uriPath += isExistQuery ? '&' : '?';
      uriPath += `ice_servers_protocol=${ice_servers_protocol}`;
      isExistQuery = true;
    }
    window.open(uriPath);
  };
  useEffect(() => {
    // URL paramsの`/room/:roomId/entrance` の roomId の部分を読み込んで roomId の初期値とする
    setRoomId(params.roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="start-layout">
      <LoginEntranceFormFieldGroup roomId={roomId} onChangeRoomId={setRoomId} onSubmitSuccess={onSubmitSuccess} />
    </div>
  );
};

export default Entrance;
