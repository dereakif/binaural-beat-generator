<script>
  let selectedIndex = 0;
  const FAQ = [
    {
      question: 'What are binaural beats?',
      answer:
        'Binaural beats are a form of auditory illusion that occurs when two tones of slightly different frequencies are played separately to each ear. When you wear headphones, one ear receives one frequency, while the other ear receives another. Your brain processes these two frequencies and perceives a third tone that is the mathematical difference between the two. For instance, if your left ear hears a tone at 200 Hz and your right ear hears one at 210 Hz, your brain will interpret a binaural beat at 10 Hz.'
    },
    {
      question: 'How can binaural beats affect the mind and body?',
      answer:
        "Binaural beats are thought to influence the brain's state by encouraging it to align its brainwave frequencies with the frequency of the binaural beat. This is based on the concept of brainwave entrainment, where it's believed that the brain can match its wave patterns to external rhythms."
    },
    {
      question: 'Why I should listen binaural beats?',
      answer:
        'Listening to binaural beats can offer various benefits, including relaxation, improved focus, better sleep quality, support during meditation, and potentially enhanced creativity. The specific effects can vary depending on the frequency of the binaural beats and individual sensitivity.'
    }
  ];
</script>

{#each FAQ as { question, answer }, i}
  <div class="collapse collapse-plus bg-base-200">
    <input
      type="radio"
      name={question}
      checked={i === selectedIndex}
      on:change={() => (selectedIndex = i)}
    />
    <div class="collapse-title text-xl font-medium">
      {question}
    </div>
    <div class="collapse-content">
      <p>{answer}</p>
    </div>
  </div>
{/each}
