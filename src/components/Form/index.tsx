import React, { useState } from 'react';
import { ArrowArcLeft } from 'phosphor-react-native';
import {
  View,
  TextInput,
  Image,
  Text,
  TouchableOpacity
} from 'react-native';

import { styles } from './styles';
import { theme } from '../../theme';
import { FeedbackType } from '../Widget';
import { feedbackTypes } from '../../utils/feedbackTypes';
import { Copyright } from '../Copyright';
import { ScreenshotButton } from '../ScreenshotButton';
import { Button } from '../Button';
import { captureScreen } from 'react-native-view-shot';
import { api } from '../../libs/api';
import * as FileSystem from 'expo-file-system';

interface Props {
  feedbackType: FeedbackType;
  onFeedbackCanceled: () => void;
  onFeedbackSend: () => void;
}

export function Form({ feedbackType, onFeedbackCanceled, onFeedbackSend }: Props) {
  const feedbackTypeInfo = feedbackTypes[feedbackType];
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [comment, setComment] = useState('')

  function handleScreenshot() {
    captureScreen({
      format: 'jpg',
      quality: 0.8,
    })
    .then(uri => setScreenshot(uri))
    .catch(err => console.log(err))
  }

  function handleScreenshotRemove() {
    setScreenshot(null);
  }

  async function handleSendFeedback() {
    if(isSendingFeedback) return;
    setIsSendingFeedback(true);

    const screenshotBase64 = screenshot 
    && await FileSystem.readAsStringAsync(screenshot, { encoding: 'base64'})

    try {
      await api.post('/feedbacks', {
        type: feedbackType,
        screenshot: `data:image/png;base64, ${screenshotBase64}`,
        comment,
      });

      onFeedbackSend();

    } catch (error) {
      console.log(error);
      setIsSendingFeedback(false);

    } finally {
      setIsSendingFeedback(false);
    }
    
  } 

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onFeedbackCanceled}
        >
          <ArrowArcLeft
            size={24}
            weight='bold'
            color={theme.colors.text_secondary}
          />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Image 
            style={styles.image}
            source={feedbackTypeInfo.image}
          />
          <Text style={styles.titleText}>
            {feedbackTypeInfo.title}
          </Text>
      </View>
      </View>

      <TextInput 
        style={styles.input}
        autoCorrect={false}
        multiline
        placeholder='Algo n??o est?? funcionando bem? Queremos corrigir. Conte com detalhes o que est?? acontecendo...'
        placeholderTextColor={theme.colors.text_secondary}
        value={comment}
        onChangeText={setComment}
      />

      <View style={styles.footer}>
        <ScreenshotButton
          screenshot={screenshot}
          onTakeShot={handleScreenshot}
          onRemoveShot={handleScreenshotRemove}
        />

        <Button
          isLoading={isSendingFeedback}
          onPress={handleSendFeedback}
        />
      </View>

      <Copyright />
    </View>
  );
}