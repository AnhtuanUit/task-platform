# realtime/consumers.py
import json

from channels.generic.websocket import AsyncWebsocketConsumer


class RealtimeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"realtime_{self.room_name}"
        self.user = self.scope["user"]
        self.user_group_name = f"user_{self.user.id}"

        if not self.user.is_authenticated:
            await self.close()
        else:
            # Join user group
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)

            # Join room group
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)

            await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # Leave user group
        await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        target = text_data_json.get("target", "room")

        if target == "user":
            await self.send_message_to_user(message)
        else:
            await self.send_message_to_room(message)

    async def send_message_to_room(self, message):
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "realtime.message", "message": message}
        )

    async def send_message_to_user(self, message):
        # Send message to user group
        await self.channel_layer.group_send(
            self.user_group_name, {"type": "realtime.message", "message": message}
        )

    # Receive message from room group
    async def realtime_message(self, event):
        data = event["data"]
        action = event["action"]
        resource = event["resource"]

        # Send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "data": data,
                    "action": action,
                    "resource": resource,
                }
            )
        )
